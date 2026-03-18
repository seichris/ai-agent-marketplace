// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import {
  encodeBrowserPaymentPayload,
  paymentNetworkForDeployment,
  rawAmountToHex,
  selectPaymentRequirement
} from "./browser-x402";

describe("browser x402 helpers", () => {
  it("converts raw decimal payment amounts to wallet-compatible hex", () => {
    expect(rawAmountToHex("50000")).toBe("0xc350");
  });

  it("selects the Fast requirement that matches the deployment network", () => {
    expect(
      selectPaymentRequirement(
        {
          accepts: [
            {
              scheme: "exact",
              network: "fast-mainnet",
              maxAmountRequired: "50000",
              payTo: "fast1mainnet"
            },
            {
              scheme: "exact",
              network: "fast-testnet",
              maxAmountRequired: "50000",
              payTo: "fast1testnet"
            }
          ]
        },
        "testnet"
      )?.network
    ).toBe("fast-testnet");

    expect(paymentNetworkForDeployment("mainnet")).toBe("fast-mainnet");
  });

  it("encodes a browser payment payload for PAYMENT-SIGNATURE", () => {
    const encoded = encodeBrowserPaymentPayload({
      paymentRequired: { x402Version: 1 },
      requirement: {
        scheme: "exact",
        network: "fast-mainnet",
        maxAmountRequired: "50000",
        payTo: "fast1destination"
      },
      certificate: {
        envelope: {},
        signatures: [1]
      }
    });

    const decoded = JSON.parse(atob(encoded)) as {
      x402Version: number;
      network: string;
      payload: { type: string };
    };

    expect(decoded.x402Version).toBe(1);
    expect(decoded.network).toBe("fast-mainnet");
    expect(decoded.payload.type).toBe("signAndSendTransaction");
  });
});
