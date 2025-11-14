import {
  L2_REGISTRAR_ADDRESS,
  L2_REGISTRY_ADDRESS,
  REVERSE_REGISTRAR_ADDRESS,
} from "./contracts";
/**
 * Permissions for onboarding flow
 * Allows subdomain registration, primary name setting, and profile text record updates
 * without requiring popup confirmations after initial grant
 */
export function getOnboardingPermissions() {
  return {
    expiry: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    feeToken: {
      limit: "0",
    },
    permissions: {
      calls: [
        {
          signature: "registerWithInvite(string,address,uint256,address,bytes)",
          to: L2_REGISTRAR_ADDRESS,
        },
        {
          signature: "setName(string)",
          to: REVERSE_REGISTRAR_ADDRESS,
        },
        {
          signature: "multicall(bytes[])",
          to: L2_REGISTRY_ADDRESS,
        },
      ],
    },
  } as const;
}
