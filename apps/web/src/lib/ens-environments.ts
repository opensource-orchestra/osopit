/**
 * ENS Environment Configuration
 *
 * Supports parallel testing on both catmisha.eth (dev) and osopit.eth (prod)
 * controlled by NEXT_PUBLIC_ENS_ENVIRONMENT variable.
 */

export type EnsEnvironmentName = "catmisha" | "osopit";

export type EnsEnvironment = {
  /** Parent ENS domain (e.g., "catmisha.eth" or "osopit.eth") */
  domain: string;
  /** L2 Registry contract address (text resolver) */
  registryAddress: `0x${string}`;
  /** L2 Registrar contract address (subdomain registration) */
  registrarAddress: `0x${string}`;
  /** Reverse Registrar contract address (primary names) */
  reverseRegistrarAddress: `0x${string}`;
  /** Block number where contracts were deployed */
  startBlock: number;
  /** Registry deployment transaction hash */
  registryDeploymentTx?: string;
  /** Registrar deployment transaction hash */
  registrarDeploymentTx?: string;
  /** The Graph subgraph endpoint URL */
  subgraphUrl: string;
};

/**
 * Environment presets for catmisha.eth and osopit.eth
 */
export const ENS_ENVIRONMENTS: Record<EnsEnvironmentName, EnsEnvironment> = {
  catmisha: {
    domain: "catmisha.eth",
    registryAddress: "0xa609955257eacbbd566a1fa654e6c5f4b1fdc9e2",
    registrarAddress: "0x63e7b8F8A8d42b043fe58Be1243d7cBcb1Ca5514",
    reverseRegistrarAddress: "0x0000000000D8e504002cC26E3Ec46D81971C1664",
    startBlock: 37_817_657,
    registryDeploymentTx:
      "0xd7d887fe0b82e85ef506f6e64606d91e6d5fa8229560f27623edc15cdeffa24c",
    registrarDeploymentTx:
      "0x8f9ed92d8a5e54a9167688368b9dbc0a1441823080387e8c110a842f025602fd",
    subgraphUrl:
      "https://api.studio.thegraph.com/query/1714097/catmisha-subgraph	",
  },
  osopit: {
    domain: "osopit.eth",
    registryAddress: "0x8c77dd23735dbe20c3cae29250bdd3bf80e6f9b1",
    registrarAddress: "0xb2576cD3Cfcc023e4A48c79BaF23A8787dc372ff",
    reverseRegistrarAddress: "0x0000000000D8e504002cC26E3Ec46D81971C1664",
    startBlock: 38_102_036,
    registrarDeploymentTx:
      "0xfd04464ee6597588b2ca297c46cfca53267cd9f6a9b5574bf9a363cd1ca5d116",
    subgraphUrl:
      "https://api.studio.thegraph.com/query/1714097/osopit-subgraphv-1/version/latest",
  },
} as const;

/**
 * Get the current ENS environment based on NEXT_PUBLIC_ENS_ENVIRONMENT
 * Defaults to "osopit" (production) if not set
 */
export function getCurrentEnsEnvironment(): EnsEnvironment {
  const envName =
    (process.env.NEXT_PUBLIC_ENS_ENVIRONMENT as EnsEnvironmentName) || "osopit";

  if (!(envName in ENS_ENVIRONMENTS)) {
    console.warn(
      `Invalid NEXT_PUBLIC_ENS_ENVIRONMENT: "${envName}". Defaulting to "osopit".`
    );
    return ENS_ENVIRONMENTS.osopit;
  }

  return ENS_ENVIRONMENTS[envName];
}

/**
 * Get the current ENS environment name
 */
export function getCurrentEnsEnvironmentName(): EnsEnvironmentName {
  const envName =
    (process.env.NEXT_PUBLIC_ENS_ENVIRONMENT as EnsEnvironmentName) || "osopit";

  if (!(envName in ENS_ENVIRONMENTS)) {
    return "osopit";
  }

  return envName;
}
