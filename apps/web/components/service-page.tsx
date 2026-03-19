"use client";

import React from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftRight, ArrowUpRight, Command, DatabaseZap, Sparkle } from "lucide-react";
import type { ServiceDetail } from "@marketplace/shared";
import type { WebDeploymentNetwork } from "@/lib/network";

import { CopyButton } from "@/components/copy-button";
import { EndpointBrowserRunner } from "@/components/endpoint-browser-runner";
import { VolumeChart } from "@/components/volume-chart";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ServicePage({
  service,
  deploymentNetwork
}: {
  service: ServiceDetail;
  deploymentNetwork: WebDeploymentNetwork;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-10 md:py-12">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Link href="/" className="font-medium text-foreground hover:underline">
              Marketplace
            </Link>
            <span>/</span>
            <span>{service.summary.name}</span>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">{service.summary.ownerName}</Badge>
              <span className="text-sm text-muted-foreground">
                {service.summary.priceRange} per call
              </span>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{service.summary.name}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{service.summary.tagline}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {service.summary.categories.map((category) => (
                <Badge key={category} variant="outline">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Calls" value={String(service.summary.totalCalls)} icon={<Sparkle className="h-4 w-4" />} />
            <StatCard label="Revenue" value={`$${service.summary.revenue}`} icon={<DatabaseZap className="h-4 w-4" />} />
            <StatCard label="Endpoints" value={String(service.summary.endpointCount)} icon={<ArrowLeftRight className="h-4 w-4" />} />
            <StatCard
              label="Success Rate (30d)"
              value={`${service.summary.successRate30d.toFixed(1)}%`}
              icon={<Command className="h-4 w-4" />}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardDescription>Transaction Volume (30d)</CardDescription>
            <CardTitle>Paid call flow over time</CardTitle>
          </CardHeader>
          <CardContent>
            <VolumeChart points={service.summary.volume30d} tokenSymbol={service.summary.settlementToken} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardDescription>About this service</CardDescription>
            <CardTitle>Service profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm leading-7 text-muted-foreground">
            <p>{service.about}</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => window.location.assign(`/suggest?service=${service.summary.slug}&type=endpoint`)}>
                Suggest an endpoint
              </Button>
              <Button variant="outline" onClick={() => window.location.assign("/suggest?type=source")}>
                Suggest a source
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardDescription>Use this service</CardDescription>
                <CardTitle>Agent-ready prompt block</CardTitle>
              </div>
              <CopyButton value={service.useThisServicePrompt} />
            </div>
            <CardDescription>
              Includes setup, the marketplace skill, and exact call parameters for each available endpoint.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border bg-muted/30 p-4">
              <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-7">
                {service.useThisServicePrompt}
              </pre>
            </div>
            <Link
              href={service.skillUrl}
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
            >
              Open canonical SKILL.md
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardDescription>Available Endpoints ({service.endpoints.length})</CardDescription>
            <CardTitle>Request docs, pricing, and examples</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {service.endpoints.map((endpoint) => (
                <AccordionItem key={endpoint.routeId} value={endpoint.routeId}>
                  <AccordionTrigger>
                    <div className="grid flex-1 gap-2 md:grid-cols-[auto_1fr_auto] md:items-center">
                      <div className="text-xs font-semibold uppercase text-muted-foreground">
                        {endpoint.method}
                      </div>
                      <div>
                        <div className="text-base font-semibold text-foreground">{endpoint.title}</div>
                        <div className="text-sm text-muted-foreground">{endpoint.description}</div>
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {endpoint.price} {endpoint.tokenSymbol}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-5 lg:grid-cols-2">
                      <div className="space-y-4 rounded-md border bg-muted/30 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-xs font-medium text-muted-foreground">Proxy URL</div>
                            <div className="mt-1 break-all text-sm font-medium">{endpoint.proxyUrl}</div>
                          </div>
                          <CopyButton value={endpoint.proxyUrl} />
                        </div>

                        {endpoint.usageNotes ? (
                          <p className="text-sm leading-7 text-muted-foreground">{endpoint.usageNotes}</p>
                        ) : null}
                      </div>

                      <ExampleBlock label="Request Example" value={JSON.stringify(endpoint.requestExample, null, 2)} />
                      <ExampleBlock label="Response Example" value={JSON.stringify(endpoint.responseExample, null, 2)} />
                      <EndpointBrowserRunner endpoint={endpoint} deploymentNetwork={deploymentNetwork} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
      <div className="flex items-center justify-between gap-3 text-muted-foreground">
        <div className="text-xs font-medium uppercase tracking-wide">{label}</div>
        {icon}
      </div>
      <div className="mt-4 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function ExampleBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-3 rounded-md border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <CopyButton value={value} />
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-7">{value}</pre>
    </div>
  );
}
