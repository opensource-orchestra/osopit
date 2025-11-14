import { useReadContract } from "wagmi";
import { L2RegistryABI } from "@/lib/abi/l2-registry";
import { L2_REGISTRY_ADDRESS } from "@/lib/contracts";

/**
 * Check if an address owns a subdomain by reading directly from the L2Registry contract
 * This is the source of truth and should be used alongside subgraph checks
 * to handle cases where the subgraph is out of sync
 */
export function useHasSubdomainContract(address: string | undefined) {
  const { data: balance, isLoading } = useReadContract({
    address: L2_REGISTRY_ADDRESS,
    abi: L2RegistryABI,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
      refetchOnWindowFocus: false,
    },
  });

  return {
    hasSubdomain: balance ? balance > BigInt(0) : false,
    balance: balance ?? BigInt(0),
    isLoading,
  };
}
