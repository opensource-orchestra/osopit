import { useQuery as useGqtyQuery } from "@/gqty";
import { _SubgraphErrorPolicy_ } from "@/gqty/schema.generated";
import { getTextRecord } from "@/lib/utils";

/**
 * Hook to check if a user has completed profile setup
 * Returns true if the user has subdomain AND has set text records (description or avatar)
 * This distinguishes between "has registered subdomain" and "has complete profile"
 */
export function useHasProfileSetup(address: string | undefined) {
  const { user, $state } = useGqtyQuery({ suspense: false });

  if (!address) {
    return {
      hasProfileSetup: false,
      isLoading: false,
    };
  }

  const result = user({
    id: address.toLowerCase(),
    subgraphError: _SubgraphErrorPolicy_.deny,
  });

  const subdomainData = result?.subdomain;

  // Check if key profile text records exist
  const description = getTextRecord(
    subdomainData?.textRecords?.(),
    "description"
  );
  const avatar = getTextRecord(subdomainData?.textRecords?.(), "avatar");

  // Profile is considered "setup" if at least one key text record exists
  const hasProfileSetup = !!(description || avatar);

  return {
    hasProfileSetup,
    isLoading: $state.isLoading,
  };
}
