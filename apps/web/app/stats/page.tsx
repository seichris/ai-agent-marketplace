import { CatalogSnapshotCard } from "@/components/catalog-snapshot-card";
import { fetchServices } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const services = await fetchServices();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-10 md:py-12">
      <section className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Stats</p>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight">Marketplace totals</h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            A live snapshot of catalog coverage and paid request volume across the public marketplace.
          </p>
        </div>
      </section>

      <CatalogSnapshotCard services={services} />
    </main>
  );
}
