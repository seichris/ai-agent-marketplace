"use client";

import React from "react";
import { useDeferredValue, useMemo, useState } from "react";
import type { ServiceSummary } from "@marketplace/shared";

import { Input } from "@/components/ui/input";
import { ServicesDataTable } from "@/components/services-data-table";

export function MarketplaceHome({ services }: { services: ServiceSummary[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const search = deferredQuery.trim().toLowerCase();

    return services.filter((service) => {
      const haystack = [service.name, service.ownerName, service.tagline, ...service.categories]
        .join(" ")
        .toLowerCase();

      return !search || haystack.includes(search);
    });
  }, [deferredQuery, services]);

  return (
    <main>
      <section>
        <h1>APIs for agents</h1>
        <p>
          Paid APIs for agents, presented in a marketplace table. Browse live Fast-native services, compare access,
          pricing, and endpoint counts, and open any listing directly.
        </p>
        <label>
          <span>Search services, owners, or categories</span>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search services, owners, or categories"
          />
        </label>
      </section>
      <section>
        <ServicesDataTable services={filtered} />
      </section>
    </main>
  );
}
