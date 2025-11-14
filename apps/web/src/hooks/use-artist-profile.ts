import { useQuery as useGqtyQuery } from "@/gqty";
import { _SubgraphErrorPolicy_ } from "@/gqty/schema.generated";
import { detectStreamPlatform } from "@/lib/broadcast";
import {
  calculateNodeHash,
  getTextRecord,
  isEthereumAddress,
  normalizeIdentifier,
  parseEnsLabel,
} from "@/lib/utils";

/**
 * Parse broadcast text record value
 * Format: "true|url|userId1|userId2|..."
 */
function parseBroadcast(value: string | undefined): {
  isLive: boolean;
  url?: string;
  taggedArtists?: string[];
} {
  if (!value) {
    return { isLive: false };
  }

  const parts = value.split("|");
  const isLive = parts[0] === "true";

  if (!isLive) {
    return { isLive: false };
  }

  return {
    isLive: true,
    url: parts[1] || undefined,
    taggedArtists: parts.slice(2).filter(Boolean),
  };
}

/**
 * Hook to fetch a single artist profile by identifier
 * Supports both ENS names (e.g., "kris" or "kris.osopit.eth") and Ethereum addresses (e.g., "0x123...")
 * Returns GQty subdomain data with streaming info
 */
export function useArtistProfile(identifier?: string) {
  const { subdomain, user, $state } = useGqtyQuery({ suspense: false });

  if (!identifier) {
    return {
      data: undefined,
      isLoading: false,
      error: null,
    };
  }

  const normalized = normalizeIdentifier(identifier);

  const result = isEthereumAddress(normalized)
    ? user({
        id: normalized,
        subgraphError: _SubgraphErrorPolicy_.deny,
      })?.subdomain
    : subdomain({
        id: calculateNodeHash(parseEnsLabel(normalized)),
        subgraphError: _SubgraphErrorPolicy_.deny,
      });

  // Parse broadcast data
  const broadcastValue = getTextRecord(
    result?.textRecords?.(),
    "app.osopit.broadcast"
  );
  const broadcast = parseBroadcast(broadcastValue);

  const data = {
    user: result?.owner,
    subdomain: result?.name,
    textRecords: result?.textRecords,
    isStreaming: broadcast.isLive,
    streamUrl: broadcast.url,
    streamPlatform: detectStreamPlatform(broadcast.url ?? "") ?? undefined,
    taggedArtists: broadcast.taggedArtists,
  };

  return {
    data,
    isLoading: $state.isLoading,
    error: $state.error,
  };
}

export type ArtistProfile = NonNullable<
  Awaited<ReturnType<typeof useArtistProfile>>["data"]
>;
