import { execFileSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

import { defaultCliDependencies } from "../packages/cli/src/lib.ts";
import { submitProviderService, verifyProviderService } from "../packages/cli/src/provider.ts";

const apiUrl = "https://api.marketplace.fast.xyz";
const serviceRef = "tavily-mainnet";
const proofUrl = "https://fastmainnettavily.8o.vc/.well-known/fast-marketplace-verification.txt";

function runReplaceScript(token: string) {
  execFileSync(
    "zsh",
    [
      "-lc",
      `ssh root@cool.8o.vc 'bash -s -- ${token}' < scripts/replace_tavily_token_remote.sh`
    ],
    { stdio: "inherit" }
  );
}

async function waitForToken(token: string) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const body = await fetch(proofUrl).then(async (response) => response.text());
    if (body.trim() === token) {
      return;
    }

    await sleep(1000);
  }

  throw new Error(`Timed out waiting for ${proofUrl} to serve ${token}`);
}

const verifyResult = await verifyProviderService(
  { serviceRef, apiUrl },
  {
    ...defaultCliDependencies(),
    confirm: async (message: string) => {
      const tokenLine = message.split("\n").find((line) => line.startsWith("Token: "));
      if (!tokenLine) {
        throw new Error(`Missing token in prompt: ${message}`);
      }

      const token = tokenLine.slice("Token: ".length).trim();
      runReplaceScript(token);
      await waitForToken(token);
      return true;
    }
  }
);

console.log(JSON.stringify({ step: "verify", verifyResult }, null, 2));

const submitResult = await submitProviderService({ serviceRef, apiUrl });
console.log(JSON.stringify({ step: "submit", submitResult }, null, 2));
