"use client";

import { formatEther } from "viem";
import { useBalance } from "wagmi";

type UseWalletBalanceResult = {
  balance: string; // Raw balance in ETH as string
  balanceNum: number; // Balance as number for calculations
  balanceUSD: string; // Formatted USD value
  balanceUSDNum: number; // USD value as number
  formatted: string; // Formatted ETH value with symbol
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
};

/**
 * Hook to get wallet balance in ETH and USD
 * Uses wagmi useBalance with USD conversion
 *
 * @param address - Wallet address to check balance for
 * @param ethPriceUSD - Current ETH price in USD (default: 2000)
 */
export function useWalletBalance(
  address: `0x${string}` | undefined,
  ethPriceUSD = 2000
): UseWalletBalanceResult {
  const { data, isPending, isError, error, refetch } = useBalance({
    address,
  });

  // Parse balance
  const balanceWei = data?.value ?? BigInt(0);
  const balance = formatEther(balanceWei);
  const balanceNum = Number.parseFloat(balance);

  // Calculate USD value
  const balanceUSDNum = balanceNum * ethPriceUSD;
  const balanceUSD = balanceUSDNum.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Format ETH with symbol
  const formatted = `${balanceNum.toFixed(4)} ETH`;

  return {
    balance,
    balanceNum,
    balanceUSD,
    balanceUSDNum,
    formatted,
    isLoading: isPending,
    isError,
    error: error as Error | null,
    refetch,
  };
}
