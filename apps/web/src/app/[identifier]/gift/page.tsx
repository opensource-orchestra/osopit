import Link from "next/link";
import { notFound } from "next/navigation";
import { TipForm } from "@/app/[identifier]/gift/_components/tip-form";
import { Button } from "@/components/ui/button";
import { getArtistProfileServer } from "@/lib/get-artist-profile-server";
import { createOgImageUrl } from "@/lib/og-utils";
import { getTextRecord } from "@/lib/utils";

type GiftPageProps = {
  params: Promise<{
    identifier: string;
  }>;
};

/**
 * Public gift/tip page for an artist
 * Server-rendered for fast initial load
 * Shareable link for receiving tips
 */
export default async function GiftPage({ params }: GiftPageProps) {
  const { identifier } = await params;

  const profile = await getArtistProfileServer(identifier);

  if (!profile?.subdomain) {
    notFound();
  }

  const artistName = profile.subdomain.name;
  const ensName = `${artistName}.osopit.eth`;
  const avatar = getTextRecord(profile.textRecords, "avatar");
  const bio = getTextRecord(profile.textRecords, "description");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-primary/20 p-4">
      <Button
        asChild
        className="w-full max-w-md justify-start px-0 text-sm hover:bg-transparent hover:opacity-60"
        size="sm"
        variant="ghost"
      >
        <Link href="/">← Back to Home</Link>
      </Button>
      <TipForm
        artistAddress={profile.address}
        artistAvatar={avatar}
        artistBio={bio}
        artistName={artistName}
        ensName={ensName}
      />
    </div>
  );
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: GiftPageProps) {
  const { identifier } = await params;
  const profile = await getArtistProfileServer(identifier);

  if (!profile?.subdomain) {
    return {
      title: "Artist Not Found",
    };
  }

  const artistName = profile.subdomain.name;
  const ogImageUrl = createOgImageUrl("/api/og/gift", { identifier });

  return {
    title: `Send a tip to ${artistName}`,
    description: `Support ${artistName} with a tip on osopit`,
    openGraph: {
      title: `Send a tip to ${artistName}`,
      description: `Support ${artistName} with a tip on osopit`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Send a tip to ${artistName}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Send a tip to ${artistName}`,
      description: `Support ${artistName} with a tip on osopit`,
      images: [ogImageUrl],
    },
  };
}
