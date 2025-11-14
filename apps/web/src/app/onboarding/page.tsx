"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { AlreadyHasProfile } from "@/app/onboarding/_components/already-has-profile";
import { ClaimSubdomainStep } from "@/app/onboarding/_components/claim-subdomain-step";
import { LoadingState } from "@/app/onboarding/_components/loading-state";
import { NoInvite } from "@/app/onboarding/_components/no-invite";
import { ProfileSetupStep } from "@/app/onboarding/_components/profile-setup-step";
import { Card } from "@/components/ui/card";
import { useCreateProfile } from "@/hooks/use-create-profile";
import { useHasProfileSetup } from "@/hooks/use-has-profile-setup";
import { useHasSubdomainContract } from "@/hooks/use-has-subdomain-contract";
import { useRegisterSubdomain } from "@/hooks/use-register-subdomain";
import type { AllValidKeys } from "@/lib/constants";
import { socialLinksToTextRecords } from "@/lib/social-platform-mapping";
import type { SocialLink } from "@/types/artist";

type InviteData = {
  label: string;
  recipient: string;
  expiration: number;
  inviter: string;
  signature: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams?.get("invite");

  const decoded: InviteData | null = inviteCode
    ? (JSON.parse(atob(inviteCode)) as InviteData)
    : null;

  const { address, connector } = useAccount();
  const isPorto = connector?.name === "Porto";

  const { hasSubdomain, isLoading: isCheckingOwnership } =
    useHasSubdomainContract(address);
  const { hasProfileSetup, isLoading: isCheckingProfile } =
    useHasProfileSetup(address);

  // Only show "already has profile" if BOTH subdomain exists AND profile setup is complete
  const hasCompleteProfile = hasSubdomain && hasProfileSetup;

  const [step, setStep] = useState<1 | 2>(1);
  const createProfile = useCreateProfile();
  const registerSubdomain = useRegisterSubdomain();
  const [isRegistered, setIsRegistered] = useState(false);

  // Form state
  const [ensName] = useState(decoded?.label || "");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<File>();
  const [socials, setSocials] = useState<SocialLink[]>([]);

  const inviteData = decoded;

  // Transform UI state to text records format
  const textRecords = useMemo<{ key: AllValidKeys; value: string }[]>(() => {
    const records: { key: AllValidKeys; value: string }[] = [];

    if (bio) {
      records.push({ key: "description", value: bio });
    }

    const socialRecords = socialLinksToTextRecords(socials);
    records.push(...socialRecords);

    return records;
  }, [bio, socials]);

  // Handle subdomain claim
  const handleClaimSubdomain = async () => {
    if (!inviteData) {
      toast.error("No invite data found");
      return;
    }
    try {
      await registerSubdomain.mutateAsync({
        label: ensName,
        inviteData,
      });
      setIsRegistered(true);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  // Handle profile submission
  const handleSubmit = async () => {
    await createProfile.mutation.mutateAsync({
      ensName,
      avatar,
      textRecords,
    });
  };

  // Loading state
  if (isCheckingOwnership || isCheckingProfile) {
    return <LoadingState />;
  }

  // Already has complete profile (subdomain + text records)
  if (hasCompleteProfile) {
    return (
      <AlreadyHasProfile
        address={address}
        ensName={ensName}
        onGoHome={() => router.push("/")}
      />
    );
  }

  // No invite data
  if (!inviteData) {
    return <NoInvite onGoHome={() => router.push("/")} />;
  }

  return (
    <div className="mx-auto w-full max-w-3xl py-12">
      <header className="mb-10 space-y-3 text-center">
        <h1 className="font-black text-3xl text-foreground leading-tight sm:text-4xl">
          Create Your Artist Profile
        </h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
          <span className="rounded-full bg-brand/10 px-3 py-1">Gas-free</span>
          <span className="rounded-full bg-brand/10 px-3 py-1">
            Decentralized
          </span>
          <span className="rounded-full bg-brand/10 px-3 py-1">
            Own your identity
          </span>
        </div>
      </header>

      <div className="mb-8 flex items-center justify-center gap-2 text-sm">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
            step === 1
              ? "bg-brand text-white"
              : "bg-muted text-muted-foreground"
          }`}
        >
          1
        </div>
        <div className="h-0.5 w-12 bg-muted" />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
            step === 2
              ? "bg-brand text-white"
              : "bg-muted text-muted-foreground"
          }`}
        >
          2
        </div>
      </div>

      <Card className="space-y-8 px-8 py-10">
        {step === 1 && (
          <ClaimSubdomainStep
            ensName={ensName}
            inviteData={inviteData}
            isPending={registerSubdomain.isPending}
            isPorto={isPorto}
            isRegistered={isRegistered}
            onClaim={handleClaimSubdomain}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <ProfileSetupStep
            avatar={avatar}
            bio={bio}
            ensName={ensName}
            isPending={createProfile.mutation.isPending}
            onAvatarChange={setAvatar}
            onBioChange={setBio}
            onSocialsChange={setSocials}
            onSubmit={handleSubmit}
            socials={socials}
          />
        )}
      </Card>
    </div>
  );
}
