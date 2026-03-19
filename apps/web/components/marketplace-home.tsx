"use client";

import React from "react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import type { ServiceSummary } from "@marketplace/shared";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function MarketplaceHome({ services }: { services: ServiceSummary[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const deferredQuery = useDeferredValue(query);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(services.flatMap((service) => service.categories))).sort()],
    [services]
  );

  const filtered = useMemo(() => {
    const search = deferredQuery.trim().toLowerCase();

    return services.filter((service) => {
      const matchesCategory = category === "All" || service.categories.includes(category);
      const haystack = [service.name, service.ownerName, service.tagline, ...service.categories]
        .join(" ")
        .toLowerCase();

      return matchesCategory && (!search || haystack.includes(search));
    });
  }, [category, deferredQuery, services]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-10 md:py-12">
      <section className="space-y-5">
        <div className="space-y-5">
          <Badge variant="outline">Fast-native agent marketplace</Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
              Discover and price agent-ready APIs in a live market catalog.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Browse paid x402 routes, compare service performance, copy exact usage prompts, and suggest the next
              endpoints or source integrations providers should ship.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search services, owners, or categories"
            className="pl-9"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                item === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <section className="grid gap-5 lg:grid-cols-2">
        {filtered.map((service) => (
          <Link key={service.slug} href={`/services/${service.slug}`} className="group">
            <Card className="h-full transition-colors group-hover:bg-accent/40">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{service.ownerName}</Badge>
                  <span className="text-sm text-muted-foreground">{service.priceRange}</span>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{service.name}</CardTitle>
                  <CardDescription>{service.tagline}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {service.categories.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                  <Metric label="Calls" value={String(service.totalCalls)} compact />
                  <Metric label="Revenue" value={`$${service.revenue}`} compact />
                  <Metric label="Endpoints" value={String(service.endpointCount)} compact />
                  <Metric label="30d success" value={`${service.successRate30d.toFixed(1)}%`} compact />
                </div>

                <div className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
                  <span>Open service</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  compact = false
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={compact ? "mt-2 text-xl font-semibold" : "mt-2 text-2xl font-semibold"}>{value}</div>
    </div>
  );
}
