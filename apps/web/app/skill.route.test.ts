import { describe, expect, it } from "vitest";

import { GET } from "./skill.md/route";

describe("skill markdown route", () => {
  it("serves the canonical SKILL.md file", async () => {
    const response = await GET();

    expect(response.headers.get("content-type")).toContain("text/markdown");
    await expect(response.text()).resolves.toContain("name: fast-marketplace");
  });
});
