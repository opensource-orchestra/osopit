#!/usr/bin/env bun
/**
 * Script to emit TextChanged events to the resolver contract
 * Usage: bun run scripts/emit-text-changed.ts
 */

import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { namehash } from "viem/ens";

// Contract addresses

const RESOLVER_ADDRESS = "0x8c77dd23735dbe20c3cae29250bdd3bf80e6f9b1"; // ITextResolver (for setText)

// ABI for setText function (which emits TextChanged)
const resolverAbi = parseAbi([
  "function setText(bytes32 node, string calldata key, string calldata value) external",
  "event TextChanged(bytes32 indexed node, string indexed indexedKey, string key, string value)",
]);

async function emitTextChanged() {
  // Check for private key in environment
  let privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ Error: PRIVATE_KEY environment variable not set");
    console.log("\nUsage:");
    console.log("  PRIVATE_KEY=0x... bun run scripts/emit-text-changed.ts");
    process.exit(1);
  }

  // Ensure private key starts with 0x
  if (!privateKey.startsWith("0x")) {
    privateKey = `0x${privateKey}`;
  }

  // Validate private key format
  if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
    console.error("❌ Error: Invalid private key format");
    console.log("Private key must be 64 hex characters (32 bytes)");
    console.log("Example: 0x1234567890abcdef...");
    process.exit(1);
  }

  // Setup account and clients
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(),
  });

  console.log("📝 Emitting TextChanged event...");
  console.log(`From: ${account.address}`);
  console.log(`Contract: ${RESOLVER_ADDRESS}`);

  // Get parameters
  const ensName = process.env.ENS_NAME || "corot.osopit.eth";
  const key = process.env.KEY || "avatar1";
  const value = process.env.VALUE || "avatar1";

  // Calculate ENS node (namehash)
  let node: `0x${string}`;

  if (ensName) {
    // Calculate namehash from ENS name
    console.log(`\nENS Name: ${ensName}`);
    node = namehash(ensName);
    console.log(`Calculated Node (namehash): ${node}`);
  } else {
    console.error("❌ Error: Either ENS_NAME or ENS_NODE must be provided");
    console.log(
      "\n⚠️  Important: You must use an ENS name that you own/control"
    );
    console.log("\nUsage Option 1 (Recommended - Auto-calculate namehash):");
    console.log(
      "  PRIVATE_KEY=0x... ENS_NAME=alice.osopit.eth bun run emit-test-event"
    );
    console.log("\nUsage Option 2 (Manual namehash):");
    console.log(
      "  PRIVATE_KEY=0x... ENS_NODE=0x1234... bun run emit-test-event"
    );
    console.log("\nMore Examples:");
    console.log(
      "  PRIVATE_KEY=0x... ENS_NAME=myname.eth KEY=avatar VALUE=https://... bun run emit-test-event"
    );
    console.log(
      '  PRIVATE_KEY=0x... ENS_NAME=alice.base.eth KEY=description VALUE="..." bun run emit-test-event'
    );
    console.log(
      "\n💡 Tip: ENS_NAME is easier - the script calculates the namehash for you!"
    );
    process.exit(1);
  }

  console.log(`Key: ${key}`);
  console.log(`Value: ${value}\n`);

  console.log("⚠️  Note: This will only work if you own/control this ENS name");
  console.log("   The L2Resolver contract has access control.\n");

  try {
    // Send transaction
    const hash = await walletClient.writeContract({
      address: RESOLVER_ADDRESS as `0x${string}`,
      abi: resolverAbi,
      functionName: "setText",
      args: [node, key, value],
    });

    console.log(`✅ Transaction sent: ${hash}`);
    console.log(`   View on Basescan: https://basescan.org/tx/${hash}`);

    // Wait for confirmation
    console.log("\n⏳ Waiting for confirmation...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    console.log(`✅ Confirmed in block ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed}`);

    // Parse logs to find TextChanged event
    const logs = receipt.logs.filter(
      (log) => log.address.toLowerCase() === RESOLVER_ADDRESS.toLowerCase()
    );

    if (logs.length > 0) {
      console.log(`\n📊 Events emitted: ${logs.length}`);
      console.log("   Your subgraph should index this event shortly!");
    }

    console.log("\n🔍 Query your subgraph with:");
    console.log(`   User ID: ${account.address.toLowerCase()}`);
    console.log(`   NameLabel ID: ${hash}-${logs.length > 0 ? "0" : "N/A"}`);
  } catch (error: any) {
    console.error("❌ Error:", error.message || error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  emitTextChanged();
}
