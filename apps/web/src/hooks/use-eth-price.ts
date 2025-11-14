"use client";

import { useQuery } from "@tanstack/react-query";

type UseEthPriceResult = {
  ethPrice: number | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
};

/**
 * Hook to fetch current ETH/USD price
 * Fetches from our API route which proxies to The Graph OHLCV endpoint
 *
 * @returns Current ETH price in USD
 */
export function useEthPrice(): UseEthPriceResult {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["eth-price"],
    queryFn: async () => {
      const response = await fetch("/api/eth-price");

      if (!response.ok) {
        throw new Error("Failed to fetch ETH price");
      }

      const result = (await response.json()) as {
        price: number;
        timestamp: string;
        source: string;
      };

      return result.price;
    },
    staleTime: 5 * 60 * 1000, // Consider stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  return {
    ethPrice: data ?? null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
