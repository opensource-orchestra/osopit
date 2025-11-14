import { resolve } from "@/gqty";
import { detectStreamPlatform } from "./broadcast";
import {
  calculateNodeHash,
  getTextRecord,
  isEthereumAddress,
  normalizeIdentifier,
  parseEnsLabel,
} from "./utils";

type TextRecord = {
  key: string;
  value: string;
};

export type ArtistProfile = {
  address: string;
  subdomain: {
    name: string;
    node: string;
  } | null;
  textRecords: TextRecord[];
  // Broadcast/streaming data
  isStreaming: boolean;
  streamUrl?: string;
  streamPlatform?: "youtube" | "twitch";
  taggedArtists: string[];
};

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

function normalizeTextRecords(
  records:
    | Array<{ key?: string | null; value?: string | null }>
    | null
    | undefined
): TextRecord[] {
  if (!records) {
    return [];
  }

  return records.map((record) => ({
    key: record?.key ?? "",
    value: record?.value ?? "",
  }));
}

function buildArtistProfileFromUser(
  user: {
    address?: string | null;
    subdomain?: {
      name?: string | null;
      node?: string | null;
      textRecords?: (args: { first: number }) => Array<{
        key?: string | null;
        value?: string | null;
      }> | null;
    } | null;
  } | null
): ArtistProfile | null {
  if (!user) {
    return null;
  }

  const subdomain = user.subdomain;
  const name = subdomain?.name ?? undefined;
  const node = subdomain?.node ?? undefined;
  const textRecords = subdomain?.textRecords?.({ first: 100 });
  const normalizedRecords = normalizeTextRecords(textRecords);

  // Parse broadcast data
  const broadcastValue = getTextRecord(
    normalizedRecords,
    "app.osopit.broadcast"
  );
  const broadcast = parseBroadcast(broadcastValue);

  return {
    address: user.address ?? "",
    subdomain: name && node ? { name, node } : null,
    textRecords: normalizedRecords,
    isStreaming: broadcast.isLive,
    streamUrl: broadcast.url,
    streamPlatform: broadcast.url
      ? (detectStreamPlatform(broadcast.url) ?? undefined)
      : undefined,
    taggedArtists: broadcast.taggedArtists ?? [],
  };
}

function buildArtistProfileFromSubdomain(
  subdomain: {
    name?: string | null;
    node?: string | null;
    owner?: { address?: string | null } | null;
    textRecords: (args: { first: number }) => Array<{
      key?: string | null;
      value?: string | null;
    }> | null;
  } | null
): ArtistProfile | null {
  if (!subdomain) {
    return null;
  }

  const name = subdomain.name ?? undefined;
  const node = subdomain.node ?? undefined;
  const ownerAddress = subdomain.owner?.address ?? "";
  const textRecords = subdomain.textRecords({ first: 100 });
  const normalizedRecords = normalizeTextRecords(textRecords);

  // Parse broadcast data
  const broadcastValue = getTextRecord(
    normalizedRecords,
    "app.osopit.broadcast"
  );
  const broadcast = parseBroadcast(broadcastValue);

  return {
    address: ownerAddress,
    subdomain: name && node ? { name, node } : null,
    textRecords: normalizedRecords,
    isStreaming: broadcast.isLive,
    streamUrl: broadcast.url,
    streamPlatform: broadcast.url
      ? (detectStreamPlatform(broadcast.url) ?? undefined)
      : undefined,
    taggedArtists: broadcast.taggedArtists ?? [],
  };
}

function fetchProfileByAddress(
  query: {
    user: (args: { id: string }) => {
      address?: string | null;
      subdomain?: {
        name?: string | null;
        node?: string | null;
        textRecords?: (args: { first: number }) => Array<{
          key?: string | null;
          value?: string | null;
        }> | null;
      } | null;
    } | null;
  },
  normalized: string
): ArtistProfile | null {
  const user = query.user({ id: normalized });
  return buildArtistProfileFromUser(user);
}

function fetchProfileBySubdomain(
  query: {
    subdomain: (args: { id: string }) => {
      name?: string | null;
      node?: string | null;
      owner?: { address?: string | null } | null;
      textRecords: (args: { first: number }) => Array<{
        key?: string | null;
        value?: string | null;
      }> | null;
    } | null;
  },
  normalized: string
): ArtistProfile | null {
  const nodeHash = calculateNodeHash(parseEnsLabel(normalized));
  const subdomain = query.subdomain({ id: nodeHash });
  return buildArtistProfileFromSubdomain(subdomain);
}

export async function getArtistProfileServer(
  identifier: string
): Promise<ArtistProfile | null> {
  const normalized = normalizeIdentifier(identifier);
  const isAddress = isEthereumAddress(normalized);

  try {
    const result = await resolve(({ query }) =>
      isAddress
        ? fetchProfileByAddress(query, normalized)
        : fetchProfileBySubdomain(query, normalized)
    );

    return result;
  } catch (error) {
    console.error("Error fetching artist profile:", error);
    return null;
  }
}
