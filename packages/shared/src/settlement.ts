import type { SettlementMode } from "./types.js";

export function usesMarketplaceTreasurySettlement(mode: SettlementMode): boolean {
  return mode === "verified_escrow";
}

export function settlementModeLabel(mode: SettlementMode): string {
  return mode === "verified_escrow" ? "Verified" : "Community";
}

export function settlementModeDescription(mode: SettlementMode): string {
  return mode === "verified_escrow"
    ? "Marketplace escrow, refunds, and payout reconciliation."
    : "Direct provider payment with provider-managed refunds and support.";
}
