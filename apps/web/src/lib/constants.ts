/**
 * Application constants and configuration values
 */
import { z } from "zod";
import { getCurrentEnsEnvironment } from "./ens-environments";

// Subdomain validation rules
export const SUBDOMAIN_VALIDATION = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 32,
  PATTERN: /^[a-z0-9-]+$/,
  ERROR_MESSAGES: {
    TOO_SHORT: "Minimum 3 characters",
    TOO_LONG: "Maximum 32 characters",
    INVALID_CHARS: "Only lowercase letters, numbers, and hyphens",
    INVALID_EDGES: "Cannot start or end with hyphen",
  },
} as const;

// Time constants
export const TIME = {
  MS_PER_SECOND: 1000,
  SECONDS_PER_DAY: 24 * 60 * 60,
  DEFAULT_INVITE_EXPIRATION_DAYS: 7,
  MS_PER_MINUTE: 60_000,
  MS_PER_HOUR: 3_600_000,
  MS_PER_DAY: 86_400_000,
  MS_PER_2_DAYS: 172_800_000,
  MS_PER_WEEK: 604_800_000,
  MS_PER_2_WEEKS: 1_209_600_000,
} as const;

// ENS configuration (dynamic based on environment)
export const ENS = {
  get PARENT_DOMAIN() {
    return getCurrentEnsEnvironment().domain;
  },
} as const;

// ENS text record keys

// Standard ENS text records
export const STANDARD_ENS_KEYS = [
  "description",
  "avatar",
  "email",
  "url",
  "header",
] as const;

// Social platform keys (standard ENS format)
export const SOCIAL_KEYS = [
  "com.twitter",
  "com.github",
  "com.discord",
  "com.telegram",
  "com.youtube",
  "com.twitch",
  "com.instagram",
  "com.tiktok",
  "com.facebook",
  "com.linkedin",
  "com.pinterest",
  "com.reddit",
  "com.spotify",
  "com.soundcloud",
] as const;

// Web3 social keys
export const WEB3_SOCIAL_KEYS = ["social.farcaster", "social.lens"] as const;

// Custom osopit keys
export const OSOPIT_KEYS = ["app.osopit.broadcast"] as const;

// Art key utilities
export const ART_KEY_PREFIX = "art." as const;

export const createArtKey = (title: string): `art.${string}` =>
  `${ART_KEY_PREFIX}${title}`;

export const isArtKey = (key: string): boolean =>
  key.startsWith(ART_KEY_PREFIX);

export const getArtTitle = (key: string): string | null =>
  isArtKey(key) ? key.slice(ART_KEY_PREFIX.length) : null;

// Combined for convenience
export const ENS_TEXT_KEYS = [
  ...STANDARD_ENS_KEYS,
  ...SOCIAL_KEYS,
  ...WEB3_SOCIAL_KEYS,
  ...OSOPIT_KEYS,
] as const;

// Type helpers
export const EnsTextKey = z.enum(ENS_TEXT_KEYS);
export type EnsTextKey = z.infer<typeof EnsTextKey>;

export const StandardEnsKey = z.enum(STANDARD_ENS_KEYS);
export type StandardEnsKey = z.infer<typeof StandardEnsKey>;
export const SocialKey = z.enum(SOCIAL_KEYS);
export type SocialKey = z.infer<typeof SocialKey>;
export const Web3SocialKey = z.enum(WEB3_SOCIAL_KEYS);
export type Web3SocialKey = z.infer<typeof Web3SocialKey>;
export const OsopitKey = z.enum(OSOPIT_KEYS);
export type OsopitKey = z.infer<typeof OsopitKey>;
export const ArtKey = z.custom<`art.${string}`>(
  (val) => typeof val === "string" && val.startsWith(ART_KEY_PREFIX)
);
export type ArtKey = z.infer<typeof ArtKey>;
export const AllValidKeys = z.union([EnsTextKey, ArtKey]);
export type AllValidKeys = z.infer<typeof AllValidKeys>;

export const THOUSAND = 1024;
const THIRTY = 30;
export const ADDRESS_PREFIX_LENGTH = 6;
export const ADDRESS_SUFFIX_LENGTH = 4;
// File upload configuration
const FOUR = 4;
export const FILE_UPLOAD = {
  MAX_AVATAR_SIZE_BYTES: FOUR * THOUSAND * THOUSAND, // 4MB
  ALLOWED_IMAGE_MIME_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ],
} as const;

// Cache configuration
export const CACHE = {
  MAX_AGE_MS: 5000, // 5 seconds
  STALE_REVALIDATE_MS: THIRTY * 60 * THOUSAND, // 30 minutes
} as const;

// Query configuration
export const QUERY = {
  SUBGRAPH_DEFAULT_LIMIT: 100,
} as const;

// Special addresses
export const ADDRESSES = {
  ZERO: "0x0000000000000000000000000000000000000000",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  // Contract errors
  INVITE_ALREADY_USED: "This invite code has already been used",
  SIGNATURE_EXPIRED: "This invite has expired. Please request a new one",
  INVALID_INVITER:
    "Invalid inviter. This wallet is not authorized to create invites",
  NAME_TAKEN:
    "This name is already taken or you already have a subdomain registered (only one per wallet is allowed)",
  UNAUTHORIZED: "You are not authorized to perform this action",

  // Transaction errors
  TRANSACTION_CANCELLED: "Transaction was cancelled",
  INSUFFICIENT_FUNDS: "Insufficient funds for transaction",
  NETWORK_CHANGED: "Network changed during transaction. Please try again",

  // Generic fallback
  GENERIC_ERROR: "An error occurred. Please try again",
} as const;

export const ARTISTS_GRID_SIZE = 6;

export const DEBOUNCE_TIME = 300;

// External API URLs
export const API_URLS = {
  GRAPH_TOKEN_API: "https://token-api.thegraph.com/v1/evm/transfers",
  GRAPH_POOL_OHLC: "https://token-api.thegraph.com/v1/evm/pools/ohlc",
} as const;

// DEX Pool Addresses for Price Data
export const GRAPH_POOLS = {
  // Ethereum mainnet USDC/WETH pool (ETH price is universal across chains)
  ETH_USDC_MAINNET: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
} as const;
