import { log, dataSource } from "@graphprotocol/graph-ts";
import { NameRegistered as NameRegisteredEvent } from "../generated/OsopitRegistry/OsopitRegistry";
import { Subdomain, User } from "../generated/schema";
import { namehash } from "./utils";

export function handleNameRegistered(event: NameRegisteredEvent): void {
  const ownerAddress = event.params.owner;

  const label = event.params.label;

  // Create or load User (by wallet address)
  const userId = event.params.owner.toHexString();
  let user = User.load(userId);
  if (user == null) {
    user = new User(userId);
    user.address = ownerAddress;
    user.createdAt = event.block.timestamp;
    user.updatedAt = event.block.timestamp;
    log.info("Creating new User: {}", [userId]);
  }

  // Get parent domain from data source context (configured in subgraph.yaml)
  const context = dataSource.context();
  const parentDomain = context.getString("parentDomain");
  
  // Calculate node hash for the subdomain
  const fullName = `${label}.${parentDomain}`;
  const nodeBytes = namehash(fullName);
  const nodeHash = nodeBytes.toHexString();
  
  log.info("Registering subdomain: {} with node hash: {}", [fullName, nodeHash]);

  let subdomain = Subdomain.load(nodeHash);
  if (subdomain == null) {
    subdomain = new Subdomain(nodeHash);
    subdomain.node = nodeBytes;
    subdomain.name = label;
    subdomain.owner = userId;
    subdomain.registeredAt = event.block.timestamp;
    subdomain.registrationTxHash = event.transaction.hash;
    subdomain.updatedAt = event.block.timestamp;
    subdomain.save();
  } else {
    log.error("Subdomain already exists: {}", [nodeHash]);
    return;
  }

  user.subdomain = nodeHash;
  user.updatedAt = event.block.timestamp;
  user.save();
}
