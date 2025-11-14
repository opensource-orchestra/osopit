import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/env";
import { API_URLS, GRAPH_POOLS } from "@/lib/constants";

// Zod schema for Graph OHLCV response
const GraphOHLCDataSchema = z.object({
  datetime: z.string(),
  ticker: z.string(),
  pool: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  uaw: z.number(),
  transactions: z.number(),
});

const GraphOHLCResponseSchema = z.object({
  data: z.array(GraphOHLCDataSchema),
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

export async function GET() {
  try {
    const graphJwt = env.GRAPH_JWT;

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Build URL for Graph OHLCV endpoint
    const url = new URL(API_URLS.GRAPH_POOL_OHLC);
    url.searchParams.set("network", "mainnet");
    url.searchParams.set("pool", GRAPH_POOLS.ETH_USDC_MAINNET);
    url.searchParams.set("interval", "1d");
    url.searchParams.set("start_time", today);
    url.searchParams.set("limit", "1");
    url.searchParams.set("page", "1");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${graphJwt}`,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Graph API error: ${response.statusText}`);
    }

    const jsonData = await response.json();
    const parseResult = GraphOHLCResponseSchema.safeParse(jsonData);

    if (!parseResult.success) {
      console.error(
        "Graph OHLCV response validation failed:",
        parseResult.error
      );
      throw new Error("Invalid response from Graph API");
    }

    const data = parseResult.data;

    if (data.data.length === 0) {
      throw new Error("No price data available");
    }

    // Use close price as current ETH price
    const priceData = data.data[0];
    const ethPrice = priceData.close;

    return NextResponse.json({
      price: ethPrice,
      timestamp: new Date().toISOString(),
      source: "uniswap_v3_mainnet",
    });
  } catch (error) {
    console.error("Error fetching ETH price:", error);
    return NextResponse.json(
      { error: "Failed to fetch ETH price" },
      { status: 500 }
    );
  }
}
