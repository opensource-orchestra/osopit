"use client";

import { AppKitButton } from "@reown/appkit/react";
import { useState } from "react";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";
import { useAccount, useDisconnect, useReadContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCheckSubdomainAvailability } from "@/hooks/use-check-subdomain-availability";
import { useGenerateInvite } from "@/hooks/use-generate-profile";
import { L2RegistrarABI } from "@/lib/abi/l2-registrar";
import {
  ADDRESS_PREFIX_LENGTH,
  ADDRESS_SUFFIX_LENGTH,
  ADDRESSES,
  DEBOUNCE_TIME,
  ENS,
  SUBDOMAIN_VALIDATION,
  TIME,
} from "@/lib/constants";
import { L2_REGISTRAR_ADDRESS } from "@/lib/contracts";
import { parseContractError } from "@/lib/parse-contract-error";

export default function InvitePage() {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const isPorto = connector?.name === "Porto";

  const [label, setLabel] = useState("");
  const [expirationDays, setExpirationDays] = useState(
    String(TIME.DEFAULT_INVITE_EXPIRATION_DAYS)
  );
  const [generatedInvite, setGeneratedInvite] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const generateInvite = useGenerateInvite();

  // Debounce label to avoid excessive queries while typing
  const [debouncedLabel] = useDebounceValue(label, DEBOUNCE_TIME);

  // Check if subdomain is available
  const { isAvailable, error: availabilityError } =
    useCheckSubdomainAvailability(debouncedLabel);

  // Track if we're waiting for debounced value to update
  const isChecking = label !== debouncedLabel && label.length > 0;

  // Check if connected wallet is a whitelisted inviter
  const { data: isInviter, isLoading: isCheckingInviter } = useReadContract({
    address: L2_REGISTRAR_ADDRESS,
    abi: L2RegistrarABI,
    functionName: "inviters",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const validateLabel = (value: string): string | null => {
    // Check length
    if (value.length < SUBDOMAIN_VALIDATION.MIN_LENGTH) {
      return SUBDOMAIN_VALIDATION.ERROR_MESSAGES.TOO_SHORT;
    }
    if (value.length > SUBDOMAIN_VALIDATION.MAX_LENGTH) {
      return SUBDOMAIN_VALIDATION.ERROR_MESSAGES.TOO_LONG;
    }

    // Check character pattern (only lowercase letters, numbers, hyphens)
    if (!SUBDOMAIN_VALIDATION.PATTERN.test(value)) {
      return SUBDOMAIN_VALIDATION.ERROR_MESSAGES.INVALID_CHARS;
    }

    // Check edge cases (cannot start or end with hyphen)
    if (value.startsWith("-") || value.endsWith("-")) {
      return SUBDOMAIN_VALIDATION.ERROR_MESSAGES.INVALID_EDGES;
    }

    return null;
  };

  const handleLabelChange = (value: string) => {
    const lowercased = value.toLowerCase();
    setLabel(lowercased);
    const error = validateLabel(lowercased);
    setValidationError(error);
  };

  const getAvailabilityMessage = () => {
    if (validationError) {
      return <p className="mt-1 text-destructive text-xs">{validationError}</p>;
    }

    if (!label || label.length === 0) {
      return (
        <p className="mt-1 text-muted-foreground text-xs">
          The subname to invite someone to register
        </p>
      );
    }

    if (availabilityError) {
      return (
        <p className="mt-1 text-warning text-xs">
          ⚠️ Unable to check availability - subgraph error
        </p>
      );
    }

    if (isChecking) {
      return (
        <p className="mt-1 text-muted-foreground text-xs">
          Checking availability...
        </p>
      );
    }

    if (isAvailable === false) {
      return (
        <p className="mt-1 text-destructive text-xs">
          ✗ This subdomain is already taken
        </p>
      );
    }

    if (isAvailable === true) {
      return (
        <p className="mt-1 text-success text-xs">
          ✓ This subdomain is available
        </p>
      );
    }

    return null;
  };

  const handleGenerateInvite = () => {
    if (!(address && label)) {
      return;
    }

    // Validate label one more time
    const error = validateLabel(label);
    if (error) {
      toast.error(error);
      return;
    }

    // Call mutation with input data
    generateInvite.mutate(
      { label, expirationDays, recipientAddress: ADDRESSES.ZERO },
      {
        onSuccess: (inviteUrl) => {
          setGeneratedInvite(inviteUrl);
          toast.success("Invite generated successfully!");
        },
        onError: (inviteError) => {
          toast.error(parseContractError(inviteError));
        },
      }
    );
  };

  const handleCopyInvite = async () => {
    if (generatedInvite) {
      await navigator.clipboard.writeText(generatedInvite);
      toast.success("Invite URL copied to clipboard!");
    }
  };

  const handleReset = () => {
    setGeneratedInvite(null);
    setLabel("");
    setExpirationDays(String(TIME.DEFAULT_INVITE_EXPIRATION_DAYS));
  };

  // Show switch wallet message if connected with Porto
  if (isPorto) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4">
        <Card className="w-full border-border bg-background/80 p-8 text-center backdrop-blur">
          <h1 className="mb-4 font-bold text-2xl text-foreground">
            Switch Wallet Required
          </h1>
          <div className="mb-6 space-y-4">
            <div className="rounded-lg border border-warning/20 bg-warning/10 p-4">
              <p className="mb-2 text-md text-warning">
                ⚠️ You're connected with Porto wallet
              </p>
              <p className="text-muted-foreground text-xs">
                Porto is for artists only. To generate invites, please
                disconnect and connect with your authorized inviter wallet
                (MetaMask, WalletConnect, etc.)
              </p>
            </div>
            <p className="text-md text-muted-foreground">
              Connected: {address?.slice(0, ADDRESS_PREFIX_LENGTH)}...
              {address?.slice(-ADDRESS_SUFFIX_LENGTH)}
            </p>
          </div>
          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => disconnect()}
              size="lg"
              variant="outline"
            >
              Disconnect Porto
            </Button>
            <AppKitButton size="md" />
          </div>
        </Card>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4">
        <Card className="w-full border-border bg-background/80 p-8 text-center backdrop-blur">
          <h1 className="mb-4 font-bold text-2xl text-foreground">
            Generate Invites
          </h1>
          <p className="mb-6 text-muted-foreground">
            Connect your wallet to generate invite codes
          </p>
          <AppKitButton size="md" />
        </Card>
      </div>
    );
  }

  if (isCheckingInviter) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4">
        <p className="text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  if (!isInviter) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4">
        <Card className="w-full border-border bg-background/80 p-8 text-center backdrop-blur">
          <h1 className="mb-4 font-bold text-2xl text-foreground">
            Unauthorized
          </h1>
          <p className="mb-4 text-muted-foreground">
            Your wallet is not authorized to generate invites.
          </p>
          <p className="text-md text-muted-foreground">
            Connected as: {address?.slice(0, ADDRESS_PREFIX_LENGTH)}...
            {address?.slice(-ADDRESS_SUFFIX_LENGTH)}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-bold text-3xl text-foreground">
          Generate Invites
        </h1>
        <p className="text-muted-foreground">
          Create invite codes for new artists to join osopit
        </p>
      </div>

      <Card className="border-border bg-background/80 p-8 backdrop-blur">
        {generatedInvite ? (
          <div className="space-y-6">
            <div className="rounded-lg border border-success/20 bg-success/10 p-4">
              <p className="mb-2 font-medium text-md text-success">
                ✓ Invite Generated Successfully
              </p>
              <p className="text-muted-foreground text-xs">
                Share this URL with the person you want to invite
              </p>
            </div>

            <div>
              <Label>Invite URL</Label>
              <div className="mt-2 break-all rounded-md border border-border bg-background p-3 font-mono text-foreground text-xs">
                {generatedInvite}
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleCopyInvite}>
                Copy URL
              </Button>
              <Button
                className="flex-1"
                onClick={handleReset}
                variant="outline"
              >
                Generate Another
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-background/80 p-4">
              <p className="mb-2 font-medium text-foreground text-md">
                Invite Details
              </p>
              <div className="space-y-1 text-muted-foreground text-xs">
                <p>
                  <span className="text-muted-foreground">Subdomain:</span>{" "}
                  {label}.{ENS.PARENT_DOMAIN}
                </p>
                <p>
                  <span className="text-muted-foreground">Expires in:</span>{" "}
                  {expirationDays} days
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <Label htmlFor="label">Subdomain</Label>
              <div className="relative mt-2">
                <Input
                  className="pr-32"
                  id="label"
                  onChange={(e) => handleLabelChange(e.target.value)}
                  placeholder="alice"
                  type="text"
                  value={label}
                />
                <span className="-translate-y-1/2 absolute top-1/2 right-3 text-md text-muted-foreground">
                  .{ENS.PARENT_DOMAIN}
                </span>
              </div>
              {getAvailabilityMessage()}
            </div>

            <div>
              <Label htmlFor="expiration">Expiration</Label>
              <select
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground text-md focus:border-brand focus:outline-none"
                id="expiration"
                onChange={(e) => setExpirationDays(e.target.value)}
                value={expirationDays}
              >
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
              <p className="mt-1 text-muted-foreground text-xs">
                How long the invite will be valid
              </p>
            </div>

            <Button
              className="w-full"
              disabled={
                !label ||
                generateInvite.isPending ||
                !!validationError ||
                isAvailable === false
              }
              onClick={handleGenerateInvite}
            >
              {generateInvite.isPending ? "Generating..." : "Generate Invite"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
