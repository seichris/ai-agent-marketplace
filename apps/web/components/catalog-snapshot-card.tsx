import React from "react";
import type { ServiceSummary } from "@marketplace/shared";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function buildMarketplaceTotals(services: ServiceSummary[]) {
  return services.reduce(
    (totals, service) => {
      totals.calls += service.totalCalls;
      totals.revenue += Number(service.revenue);
      totals.endpoints += service.endpointCount;
      return totals;
    },
    { calls: 0, revenue: 0, endpoints: 0 }
  );
}

export function CatalogSnapshotCard({ services }: { services: ServiceSummary[] }) {
  const totals = buildMarketplaceTotals(services);

  return (
    <Card>
      <CardHeader>
        <CardDescription>Marketplace totals</CardDescription>
        <CardTitle>Catalog snapshot</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Metric label="Services" value={String(services.length)} />
        <Metric label="Endpoints" value={String(totals.endpoints)} />
        <Metric label="Call volume" value={String(totals.calls)} />
        <Metric label="Revenue" value={`$${totals.revenue.toFixed(2)}`} />
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
