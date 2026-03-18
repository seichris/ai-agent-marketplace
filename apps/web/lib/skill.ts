import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const CANDIDATE_PATHS = [
  resolve(process.cwd(), "SKILL.md"),
  resolve(process.cwd(), "../SKILL.md"),
  resolve(process.cwd(), "../../SKILL.md")
];

export async function readSkillMarkdown(): Promise<string> {
  for (const candidate of CANDIDATE_PATHS) {
    try {
      await access(candidate);
      return await readFile(candidate, "utf8");
    } catch {
      continue;
    }
  }

  throw new Error("SKILL.md not found.");
}
