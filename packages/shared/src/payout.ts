import { getDefaultMarketplaceNetworkConfig } from "./network.js";
import { usesMarketplaceTreasurySettlement } from "./settlement.js";
import type { MarketplaceRoute, PersistedPayoutSplit } from "./types.js";

const BPS_SCALE = 10_000n;

export function buildPayoutSplit(input: {
  route: MarketplaceRoute;
  treasuryWallet: string;
  paymentDestinationWallet: string;
  quotedPrice: string;
}): PersistedPayoutSplit {
  const network = getDefaultMarketplaceNetworkConfig();
  const treasurySettlement = usesMarketplaceTreasurySettlement(input.route.settlementMode);
  const providerBps = treasurySettlement ? BigInt(input.route.payout.providerBps) : BPS_SCALE;
  if (providerBps < 0n || providerBps > BPS_SCALE) {
    throw new Error(`Invalid provider payout bps: ${input.route.payout.providerBps}`);
  }

  const totalAmount = BigInt(input.quotedPrice);
  const providerAmount = (totalAmount * providerBps) / BPS_SCALE;
  const marketplaceAmount = totalAmount - providerAmount;

  return {
    currency: network.tokenSymbol,
    settlementMode: input.route.settlementMode,
    paymentDestinationWallet: input.paymentDestinationWallet,
    usesTreasurySettlement: treasurySettlement,
    marketplaceWallet: input.treasuryWallet,
    marketplaceBps: Number(BPS_SCALE - providerBps),
    marketplaceAmount: marketplaceAmount.toString(),
    providerAccountId: input.route.payout.providerAccountId,
    providerWallet: input.route.payout.providerWallet,
    providerBps: Number(providerBps),
    providerAmount: providerAmount.toString()
  };
}
