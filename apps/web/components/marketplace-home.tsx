"use client";

import React from "react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import type { ServiceSummary } from "@marketplace/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

  const totals = buildMarketplaceTotals(services);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 py-8 md:px-10 md:py-12">
      <section className="relative overflow-hidden rounded-[36px] border border-border/70 bg-[linear-gradient(140deg,rgba(255,250,240,0.96),rgba(249,240,216,0.84)_58%,rgba(238,223,182,0.7))] px-6 py-8 shadow-[0_30px_120px_-60px_rgba(15,23,42,0.55)] md:px-10 md:py-12">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top,rgba(217,119,6,0.22),transparent_55%)] md:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-5">
            <Badge className="bg-background/75 text-foreground">Fast-native agent marketplace</Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-sans text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                Paid APIs for agents, presented like a real marketplace.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-foreground/72 md:text-lg">
                Browse live x402 routes, copy exact agent-ready usage prompts, and suggest the next endpoints or source
                integrations providers should build.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => window.location.assign("/suggest")}>
                Suggest a source
              </Button>
              <Button variant="secondary" onClick={() => window.location.assign("/skill.md")}>
                Read SKILL.md
              </Button>
            </div>
          </div>

          <Card className="border-black/5 bg-black/[0.02]">
            <CardHeader>
              <CardDescription>Marketplace totals</CardDescription>
              <CardTitle className="text-3xl">Live catalog snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Services</div>
                <div className="mt-2 text-3xl font-semibold">{services.length}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Endpoints</div>
                <div className="mt-2 text-3xl font-semibold">{totals.endpoints}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Call volume</div>
                <div className="mt-2 text-3xl font-semibold">{totals.calls}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1fr_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search services, owners, or categories"
            className="pl-11"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                item === category
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {filtered.map((service) => (
          <Link key={service.slug} href={`/services/${service.slug}`} className="group">
            <Card className="h-full transition-transform duration-200 group-hover:-translate-y-1">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{service.ownerName}</Badge>
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {service.priceRange}
                  </span>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{service.name}</CardTitle>
                  <CardDescription>{service.tagline}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {service.categories.map((item) => (
                    <Badge key={item} className="bg-background">
                      {item}
                    </Badge>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Calls</div>
                    <div className="mt-2 text-2xl font-semibold">{service.totalCalls}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Revenue</div>
                    <div className="mt-2 text-2xl font-semibold">${service.revenue}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Endpoints</div>
                    <div className="mt-2 text-2xl font-semibold">{service.endpointCount}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">30d success</div>
                    <div className="mt-2 text-2xl font-semibold">{service.successRate30d.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/70 pt-4 text-sm text-muted-foreground">
                  <span>Open service page</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
