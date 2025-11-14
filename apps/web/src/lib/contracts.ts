import { L2RegistrarABI } from "./abi/l2-registrar";
import { L2RegistryABI } from "./abi/l2-registry";
import { ReverseRegistrarABI } from "./abi/reverse-registrar";
import {
  getCurrentEnsEnvironment,
  getCurrentEnsEnvironmentName,
} from "./ens-environments";

/**
 * Contract addresses (dynamic based on ENS environment)
 */
export const L2_REGISTRY_ADDRESS = getCurrentEnsEnvironment().registryAddress;
export const L2_REGISTRAR_ADDRESS = getCurrentEnsEnvironment().registrarAddress;
export const REVERSE_REGISTRAR_ADDRESS =
  getCurrentEnsEnvironment().reverseRegistrarAddress;

/**
 * Combined contract configuration
 */
export const CONTRACTS = {
  L2Registry: {
    get address() {
      return getCurrentEnsEnvironment().registryAddress;
    },
    abi: L2RegistryABI,
  },
  L2Registrar: {
    get address() {
      return getCurrentEnsEnvironment().registrarAddress;
    },
    abi: L2RegistrarABI,
  },
  ReverseRegistrar: {
    get address() {
      return getCurrentEnsEnvironment().reverseRegistrarAddress;
    },
    abi: ReverseRegistrarABI,
  },
} as const;

/**
 * Contract metadata including deployment info and explorer links
 */
export const CONTRACT_METADATA = {
  get L2Registry() {
    const env = getCurrentEnsEnvironment();
    const envName = getCurrentEnsEnvironmentName();
    return {
      address: env.registryAddress,
      abi: L2RegistryABI,
      deploymentBlock: env.startBlock,
      deploymentTx: env.registryDeploymentTx,
      explorer: `https://basescan.org/address/${env.registryAddress}`,
      name: `L2 Registry (${envName === "catmisha" ? "catmisha.eth" : "osopit.eth"})`,
    };
  },
  get L2Registrar() {
    const env = getCurrentEnsEnvironment();
    const envName = getCurrentEnsEnvironmentName();
    return {
      address: env.registrarAddress,
      abi: L2RegistrarABI,
      deploymentBlock: env.startBlock,
      deploymentTx: env.registrarDeploymentTx,
      explorer: `https://basescan.org/address/${env.registrarAddress}`,
      name: `L2 Registrar (${envName === "catmisha" ? "catmisha.eth" : "osopit.eth"})`,
    };
  },
  get ReverseRegistrar() {
    const env = getCurrentEnsEnvironment();
    return {
      address: env.reverseRegistrarAddress,
      abi: ReverseRegistrarABI,
      explorer: `https://basescan.org/address/${env.reverseRegistrarAddress}`,
      name: "Reverse Registrar (Primary Names on Base)",
    };
  },
} as const;
