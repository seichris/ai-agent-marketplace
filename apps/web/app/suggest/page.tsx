import Link from "next/link";

import { SuggestionForm } from "@/components/suggestion-form";
import { fetchServices } from "@/lib/api";

export const dynamic = "force-dynamic";

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SuggestPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const services = await fetchServices();
  const defaultServiceSlug = getSingleParam(params.service);
  const defaultType = getSingleParam(params.type) === "source" ? "source" : "endpoint";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-8 md:px-10 md:py-12">
      <section className="rounded-[32px] border border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.14),transparent_26%),linear-gradient(160deg,rgba(10,14,26,0.94),rgba(9,12,20,0.96))] p-8 shadow-[0_40px_120px_-70px_rgba(0,0,0,1)]">
        <div className="space-y-4">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Back to marketplace
          </Link>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Suggest a new endpoint or source</h1>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground">
              Use this queue to tell providers what to build next. Suggestions stay private and are reviewed in the
              internal marketplace triage board.
            </p>
          </div>
        </div>
      </section>

      <SuggestionForm
        services={services}
        defaultServiceSlug={defaultServiceSlug}
        defaultType={defaultType}
      />
    </main>
  );
}
