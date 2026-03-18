"use client";

import React from "react";
import { useActionState } from "react";
import type { ServiceSummary } from "@marketplace/shared";

import { submitSuggestionAction, type SuggestionActionState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: SuggestionActionState = {
  ok: false,
  message: ""
};

export function SuggestionForm({
  services,
  defaultServiceSlug,
  defaultType
}: {
  services: ServiceSummary[];
  defaultServiceSlug?: string;
  defaultType: "endpoint" | "source";
}) {
  const [state, action, pending] = useActionState(submitSuggestionAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardDescription>Suggest new supply</CardDescription>
        <CardTitle className="text-3xl">Tell providers what to build next</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Suggestion type
              <select
                name="type"
                defaultValue={defaultType}
                className="h-12 rounded-2xl border border-border bg-background px-4 text-sm"
              >
                <option value="endpoint">Endpoint</option>
                <option value="source">Source / Webservice</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Service
              <select
                name="serviceSlug"
                defaultValue={defaultServiceSlug ?? ""}
                className="h-12 rounded-2xl border border-border bg-background px-4 text-sm"
              >
                <option value="">No specific service</option>
                {services.map((service) => (
                  <option key={service.slug} value={service.slug}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium">
            Title
            <Input name="title" placeholder="Add a ranked signal watchlist endpoint" required />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Description
            <Textarea
              name="description"
              placeholder="Describe the endpoint or source, the data it should return, and why it matters."
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Source URL
            <Input name="sourceUrl" placeholder="https://..." />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Your name
              <Input name="requesterName" placeholder="Optional" />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Email
              <Input name="requesterEmail" type="email" placeholder="Optional" />
            </label>
          </div>

          {state.message ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                state.ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900" : "border-rose-500/30 bg-rose-500/10 text-rose-900"
              }`}
            >
              {state.message}
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Submitting..." : "Submit suggestion"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
