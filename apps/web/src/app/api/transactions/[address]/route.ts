import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { z } from "zod";
import { env } from "@/env";
import { API_URLS } from "@/lib/constants";

// Zod schema for Graph Token API transaction
const GraphTransferSchema = z.object({
  block_num: z.number(),
  datetime: z.string(),
  timestamp: z.number(),
  transaction_id: z.string(),
  log_index: z.number(),
  contract: z.string(), // "0xeeee...eeee" for native ETH
  from: z.string(),
  to: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  amount: z.string(), // Wei as string
  value: z.number(), // Already formatted as decimal
  network: z.string(),
});

// Zod schema for Graph API response
const GraphApiResponseSchema = z.object({
  data: z.array(GraphTransferSchema),
  statistics: z.object({
    bytes_read: z.number(),
    rows_read: z.number(),
    elapsed: z.number(),
  }),
  pagination: z.object({
    previous_page: z.number(),
    current_page: z.number(),
  }),
  results: z.number(),
  request_time: z.string(),
  duration_ms: z.number(),
});

// Our unified transaction type
type UnifiedTransaction = {
  hash: string;
  from: string;
  to: string;
  value: string; // Wei as string (for consistency)
  timestamp: number;
  blockNumber: number;
  exchangeRate: null; // Graph API doesn't provide this
  type: "normal";
};

const NATIVE_ETH_CONTRACT = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    // Validate address format
    if (!isAddress(address)) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 }
      );
    }

    const graphJwt = env.GRAPH_JWT;

    // Build URLs for received and sent transactions
    const baseParams = new URLSearchParams({
      network: "base",
      limit: "10", // Free tier max
      page: "1",
    });

    const receivedUrl = new URL(API_URLS.GRAPH_TOKEN_API);
    receivedUrl.search = new URLSearchParams({
      ...Object.fromEntries(baseParams),
      to_address: address,
    }).toString();

    const sentUrl = new URL(API_URLS.GRAPH_TOKEN_API);
    sentUrl.search = new URLSearchParams({
      ...Object.fromEntries(baseParams),
      from_address: address,
    }).toString();

    // Fetch both received and sent transactions in parallel
    const [receivedResponse, sentResponse] = await Promise.all([
      fetch(receivedUrl.toString(), {
        headers: {
          Authorization: `Bearer ${graphJwt}`,
        },
        next: { revalidate: 60 },
      }),
      fetch(sentUrl.toString(), {
        headers: {
          Authorization: `Bearer ${graphJwt}`,
        },
        next: { revalidate: 60 },
      }),
    ]);

    if (!(receivedResponse.ok && sentResponse.ok)) {
      throw new Error("Graph API error");
    }

    // Parse responses
    const [receivedData, sentData] = await Promise.all([
      receivedResponse.json(),
      sentResponse.json(),
    ]);

    // Validate responses
    const receivedParsed = GraphApiResponseSchema.safeParse(receivedData);
    const sentParsed = GraphApiResponseSchema.safeParse(sentData);

    if (!(receivedParsed.success && sentParsed.success)) {
      console.error("Graph API response validation failed");
      throw new Error("Invalid response from Graph API");
    }

    const transactions: UnifiedTransaction[] = [];

    // Process received transactions - only native ETH
    for (const transfer of receivedParsed.data.data) {
      // Only include native ETH transfers (skip ERC-20/721 tokens)
      if (transfer.contract.toLowerCase() !== NATIVE_ETH_CONTRACT) {
        continue;
      }

      transactions.push({
        hash: transfer.transaction_id,
        from: transfer.from.toLowerCase(),
        to: transfer.to.toLowerCase(),
        value: transfer.amount, // Use wei string for consistency
        timestamp: transfer.timestamp,
        blockNumber: transfer.block_num,
        exchangeRate: null, // Graph doesn't provide historical price
        type: "normal",
      });
    }

    // Process sent transactions - only native ETH
    for (const transfer of sentParsed.data.data) {
      // Only include native ETH transfers (skip ERC-20/721 tokens)
      if (transfer.contract.toLowerCase() !== NATIVE_ETH_CONTRACT) {
        continue;
      }

      transactions.push({
        hash: transfer.transaction_id,
        from: transfer.from.toLowerCase(),
        to: transfer.to.toLowerCase(),
        value: transfer.amount, // Use wei string for consistency
        timestamp: transfer.timestamp,
        blockNumber: transfer.block_num,
        exchangeRate: null, // Graph doesn't provide historical price
        type: "normal",
      });
    }

    // Remove duplicates and sort by timestamp (most recent first)
    const uniqueTransactions = Array.from(
      new Map(transactions.map((tx) => [tx.hash, tx])).values()
    )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);

    return NextResponse.json({ transactions: uniqueTransactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
