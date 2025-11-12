"use client";

import { Cuer } from "cuer";
import { CheckCheck, ChevronDown, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSendTip } from "@/hooks/use-send-tip";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type DonationContentProps = {
  artistEnsName: string;
  walletAddress?: string;
  onSuccess?: () => void;
};

const ONE_CENT = 0.01;
const ONE_FIFTY_CENTS = 0.5;
const ONE_DOLLAR = 1;
const FIVE_DOLLARS = 5;
const TEN_DOLLARS = 10;
const TWENTY_DOLLARS = 20;
const FIFTY_DOLLARS = 50;
const ONE_HUNDRED_DOLLARS = 100;
const PRESET_AMOUNTS = [
  ONE_CENT,
  ONE_FIFTY_CENTS,
  ONE_DOLLAR,
  FIVE_DOLLARS,
  TEN_DOLLARS,
  TWENTY_DOLLARS,
  FIFTY_DOLLARS,
  ONE_HUNDRED_DOLLARS,
];

function DonationContent({
  artistEnsName,
  walletAddress,
  onSuccess,
}: DonationContentProps) {
  const [amount, setAmount] = useState("0.01");
  const [customAmount, setCustomAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [showWalletAddress, setShowWalletAddress] = useState(false);
  const { mutate, isPending } = useSendTip();

  const selectedAmount = customAmount || amount;

  const handleSend = async () => {
    await mutate(artistEnsName, selectedAmount);
    onSuccess?.();
  };

  const handleCopyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        toast.success("Wallet address copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch (_error) {
        toast.error("Failed to copy address");
      }
    }
  };

  const truncateAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="">
      <div className="mb-4">
        <h3 className="mb-2 font-bold text-lg">
          Send a Gift to {artistEnsName}
        </h3>
      </div>

      {walletAddress && (
        <div className="mb-6 overflow-hidden rounded-lg border border-border bg-card/50">
          <Button
            className="w-full justify-between rounded-none border-0 border-border border-b bg-transparent hover:bg-card/70"
            onClick={() => setShowWalletAddress(!showWalletAddress)}
            variant="outline"
          >
            <span className="font-medium text-foreground text-sm">
              Artist Wallet Address
            </span>
            <div
              className={`transition-transform duration-300 ${
                showWalletAddress ? "rotate-180" : ""
              }`}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </Button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showWalletAddress
                ? "max-h-[500px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-foreground text-sm">
                  {truncateAddress(walletAddress)}
                </code>
                <Button onClick={handleCopyAddress} size="sm" variant="outline">
                  {copied ? (
                    <CheckCheck className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex justify-center">
                <div className="rounded-lg bg-white p-3">
                  <Cuer color="black" size={180} value={walletAddress} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="mt-3 grid grid-cols-4 gap-2">
          {PRESET_AMOUNTS.map((presetAmount) => (
            <button
              className={`rounded-lg border py-3 font-medium transition-colors ${
                amount === presetAmount.toString() && !customAmount
                  ? "border-brand bg-brand/20 text-brand"
                  : "border-border text-muted-foreground hover:border-border"
              }`}
              key={presetAmount}
              onClick={() => {
                setAmount(presetAmount.toString());
                setCustomAmount("");
              }}
              type="button"
            >
              {presetAmount}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <Label htmlFor="custom">Custom Amount</Label>
          <Input
            className="mt-2"
            id="custom"
            min="0"
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="0.0"
            step="0.001"
            type="number"
            value={customAmount}
          />
        </div>

        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <div className="flex justify-between text-md">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-mono font-semibold text-foreground">
              {selectedAmount} ETH
            </span>
          </div>
        </div>
      </div>

      <Button
        className="w-full"
        disabled={
          isPending || !selectedAmount || Number.parseFloat(selectedAmount) <= 0
        }
        onClick={handleSend}
      >
        {isPending ? "Sending..." : "Send Gift 💜"}
      </Button>

      <p className="mt-3 text-center text-muted-foreground text-xs">
        This will send ETH directly to the artist's wallet
      </p>
    </div>
  );
}

const MOBILE_WIDTH = 768;

type DonationPopoverProps = {
  ensName: string;
  walletAddress?: string;
  children: React.ReactNode;
};

export function DonationPopover({
  ensName,
  walletAddress,
  children,
}: DonationPopoverProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_WIDTH);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  // Mobile: use Drawer
  if (isMobile) {
    return (
      <Drawer onOpenChange={setIsOpen} open={isOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="border-border bg-card">
          <DrawerHeader>
            <DrawerTitle className="text-foreground">Send a Gift</DrawerTitle>
          </DrawerHeader>
          <div className="mt-4 px-4 pb-4">
            <DonationContent
              artistEnsName={ensName}
              onSuccess={handleSuccess}
              walletAddress={walletAddress}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: use Popover
  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="border-border bg-card p-4">
        <DonationContent
          artistEnsName={ensName}
          onSuccess={handleSuccess}
          walletAddress={walletAddress}
        />
      </PopoverContent>
    </Popover>
  );
}
