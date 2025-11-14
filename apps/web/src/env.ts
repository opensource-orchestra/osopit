import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    MERCHANT_ADDRESS: z.string().min(1),
    MERCHANT_PRIVATE_KEY: z.string().min(1),
    GRAPH_JWT: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_ENS_ENVIRONMENT: z
      .enum(["catmisha", "osopit"])
      .default("osopit")
      .optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    NEXT_PUBLIC_ENS_ENVIRONMENT: process.env.NEXT_PUBLIC_ENS_ENVIRONMENT,
  },
});
