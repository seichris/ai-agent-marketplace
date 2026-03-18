import Link from "next/link";
import { redirect } from "next/navigation";

import { adminLogoutAction, updateSuggestionAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAdminSuggestions } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminSuggestionsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const statusFilter = getSingleParam(params.status);
  const suggestions = await fetchAdminSuggestions(
    statusFilter === "submitted" ||
      statusFilter === "reviewing" ||
      statusFilter === "accepted" ||
      statusFilter === "rejected" ||
      statusFilter === "shipped"
      ? statusFilter
      : undefined
  );
  const selectClassName =
    "h-11 rounded-2xl border border-border bg-black/20 px-4 text-sm text-foreground outline-none transition-colors focus:border-ring";
  const textareaClassName =
    "min-h-24 rounded-[24px] border border-border bg-black/20 px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-ring";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-10 md:py-12">
      <section className="flex flex-wrap items-end justify-between gap-4 rounded-[32px] border border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.14),transparent_26%),linear-gradient(160deg,rgba(10,14,26,0.94),rgba(9,12,20,0.96))] p-8 shadow-[0_40px_120px_-70px_rgba(0,0,0,1)]">
        <div className="space-y-3">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Back to marketplace
          </Link>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Suggestion queue</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Private intake for new endpoints and source integrations. Update status as providers pick up work.
            </p>
          </div>
        </div>
        <form action={adminLogoutAction}>
          <Button type="submit" variant="secondary">
            Log out
          </Button>
        </form>
      </section>

      <section className="flex flex-wrap gap-2">
        {["all", "submitted", "reviewing", "accepted", "rejected", "shipped"].map((status) => {
          const href = status === "all" ? "/admin/suggestions" : `/admin/suggestions?status=${status}`;
          const isActive = (status === "all" && !statusFilter) || statusFilter === status;

          return (
            <Link
              key={status}
              href={href}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                isActive ? "border-white bg-white text-black" : "border-border bg-card"
              }`}
            >
              {status}
            </Link>
          );
        })}
      </section>

      <section className="grid gap-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id}>
            <CardHeader className="gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{suggestion.type}</Badge>
                    <Badge className="bg-background">{suggestion.status}</Badge>
                    {suggestion.serviceSlug ? <Badge className="bg-background">{suggestion.serviceSlug}</Badge> : null}
                  </div>
                  <CardTitle>{suggestion.title}</CardTitle>
                  <CardDescription>{suggestion.description}</CardDescription>
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {suggestion.createdAt.slice(0, 10)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm text-muted-foreground">
                {suggestion.sourceUrl ? <div>Source URL: {suggestion.sourceUrl}</div> : null}
                {suggestion.requesterEmail ? <div>Requester: {suggestion.requesterEmail}</div> : null}
              </div>

              <form action={updateSuggestionAction} className="grid gap-4 lg:grid-cols-[180px_1fr_auto]">
                <input type="hidden" name="id" value={suggestion.id} />
                <label className="grid gap-2 text-sm font-medium">
                  Status
                  <select
                    name="status"
                    defaultValue={suggestion.status}
                    className={selectClassName}
                  >
                    <option value="submitted">submitted</option>
                    <option value="reviewing">reviewing</option>
                    <option value="accepted">accepted</option>
                    <option value="rejected">rejected</option>
                    <option value="shipped">shipped</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  Internal notes
                  <textarea
                    name="internalNotes"
                    defaultValue={suggestion.internalNotes ?? ""}
                    className={textareaClassName}
                  />
                </label>

                <div className="flex items-end">
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
