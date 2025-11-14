"use client";

import { ArrowUpRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type QuickActionsRowProps = {
  onSend: () => void;
  onShare: () => void;
};

export function QuickActionsRow({ onSend, onShare }: QuickActionsRowProps) {
  return (
    <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
      <ActionButton
        icon={<ArrowUpRight className="size-5" />}
        label="Send"
        onClick={onSend}
        variant="default"
      />
      <ActionButton
        icon={<Share2 className="size-5" />}
        label="Share Link"
        onClick={onShare}
      />
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  variant = "outline",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "outline";
}) {
  return (
    <Button
      className="flex min-w-[120px] flex-col gap-2 py-6"
      onClick={onClick}
      variant={variant}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Button>
  );
}
