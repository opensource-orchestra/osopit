import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { isAddress, keccak256, toBytes } from "viem";
import { namehash } from "viem/ens";
import { type AllValidKeys, ENS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateNodeHash(label: string) {
  const fullName = `${label}.${ENS.PARENT_DOMAIN}`;
  return namehash(fullName);
}

/**
 * Check if input is an Ethereum address
 * @param input - String to check (ENS name or address)
 * @returns true if input is a valid Ethereum address
 */
export function isEthereumAddress(input: string): boolean {
  return isAddress(input);
}

/**
 * Parse ENS name to extract the subdomain label
 * Handles both "kris" and "kris.osopit.eth" formats
 * @param ensName - Full or partial ENS name
 * @returns The subdomain label (first part before first dot)
 */
export function parseEnsLabel(ensName: string): string {
  const parts = ensName.split(".");
  return parts[0];
}

/**
 * Normalize identifier for consistent querying
 * - Addresses are lowercased (subgraph uses lowercase IDs)
 * - ENS names are returned as-is (will be parsed separately)
 * @param identifier - Address or ENS name
 * @returns Normalized identifier
 */
export function normalizeIdentifier(identifier: string): string {
  if (isAddress(identifier)) {
    return identifier.toLowerCase();
  }
  return identifier;
}

export function ipfsToHttp(url: string | undefined | null): string {
  if (!url || url.trim() === "") {
    return "https://avatars.jakerunzer.com/placeholder";
  }
  if (url.startsWith("ipfs://")) {
    const hash = url.replace("ipfs://", "");
    return `https://ipfs.io/ipfs/${hash}`;
  }
  return url;
}

export function getTextRecord(
  records:
    | {
        key?: string | null;
        value?: string | null;
      }[]
    | undefined
    | null,
  key: AllValidKeys
): string {
  if (!records) {
    return "";
  }
  return records.find((record) => record.key === key)?.value ?? "";
}

/**
 * Extract initials from artist name
 */
export function getInitials(name: string): string {
  if (!name) {
    return "?";
  }

  // Remove .orchestraid.eth or similar suffixes
  const cleanName = name.split(".")[0];

  // Take first 2 characters
  return cleanName.slice(0, 2).toUpperCase();
}

/**
 * Generate consistent color from string
 */
export function stringToColor(str: string): string {
  if (!str) {
    return "hsl(0, 0%, 50%)";
  }

  // Simple hash function
  // convert string to bytes
  const bytes = toBytes(str);
  const hash = Number(keccak256(bytes));

  // Generate hue (0-360)
  const hue = Math.abs(hash) % 360;

  // Use consistent saturation and lightness for subtle colors
  return `hsl(${hue}, 60%, 45%)`;
}

/**
 * Format address for display (0x1234...5678)
 */
export function formatAddress(
  address: string,
  prefixLength = 6,
  suffixLength = 4
): string {
  if (!address || address.length < prefixLength + suffixLength) {
    return address;
  }
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}
