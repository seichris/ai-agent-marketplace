import React from "react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="space-y-1">
          <div className="text-sm font-medium text-foreground">Fast Marketplace</div>
          <p className="text-sm text-muted-foreground">
            Discovery, docs, and request intake for Fast-native agent APIs.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/suggest?type=endpoint"
            className="rounded-full border border-border bg-card px-4 py-2 font-medium text-foreground transition-colors hover:bg-white/8"
          >
            Suggest an endpoint
          </Link>
          <Link
            href="/suggest?type=source"
            className="rounded-full border border-border bg-card px-4 py-2 font-medium text-foreground transition-colors hover:bg-white/8"
          >
            Suggest a source
          </Link>
        </nav>
      </div>
    </footer>
  );
}
