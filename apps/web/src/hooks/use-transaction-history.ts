"use client";

import { useQuery } from "@tanstack/react-query";
import { formatEther } from "viem";

export type Transaction = {
  hash: string;
  from: string;
  to: string;
  value: string; // Wei as string
  timestamp: number; // Unix timestamp in seconds
  blockNumber: number;
  exchangeRate: string | null; // ETH/USD price at transaction time
  type: "normal" | "internal"; // Transaction type
  valueETH: string; // Formatted ETH value
  valueETHNum: number; // ETH value as number
  valueUSD: number | null; // USD value at transaction time
  direction: "incoming" | "outgoing"; // Relative to user address
};

type UseTransactionHistoryResult = {
  transactions: Transaction[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
};

/**
 * Hook to fetch transaction history for a wallet address
 * Fetches from our API route which proxies to Blockscout
 *
 * @param address - Wallet address to fetch transactions for
 */
export function useTransactionHistory(
  address: `0x${string}` | undefined
): UseTransactionHistoryResult {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["transaction-history", address],
    queryFn: async () => {
      if (!address) {
        throw new Error("Address is required");
      }

      const response = await fetch(`/api/transactions/${address}`);

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const result = (await response.json()) as {
        transactions: Array<{
          hash: string;
          from: string;
          to: string;
          value: string;
          timestamp: number;
          blockNumber: number;
          exchangeRate: string | null;
          type: "normal" | "internal";
        }>;
      };

      return result.transactions;
    },
    enabled: !!address,
    staleTime: 60 * 1000, // Consider stale after 1 minute
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Process transactions to add ETH formatting, USD value, and direction
  const transactions: Transaction[] =
    data?.map((tx) => {
      const valueETH = formatEther(BigInt(tx.value));
      const valueETHNum = Number.parseFloat(valueETH);
      const direction =
        tx.to.toLowerCase() === address?.toLowerCase()
          ? "incoming"
          : "outgoing";

      // Calculate USD value if exchange rate is available
      const valueUSD =
        tx.exchangeRate !== null
          ? valueETHNum * Number.parseFloat(tx.exchangeRate)
          : null;

      return {
        ...tx,
        valueETH,
        valueETHNum,
        valueUSD,
        direction,
      };
    }) ?? [];

  return {
    transactions,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
