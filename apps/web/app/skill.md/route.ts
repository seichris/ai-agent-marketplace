import { readSkillMarkdown } from "@/lib/skill";

export async function GET() {
  const markdown = await readSkillMarkdown();

  return new Response(markdown, {
    headers: {
      "content-type": "text/markdown; charset=utf-8"
    }
  });
}
