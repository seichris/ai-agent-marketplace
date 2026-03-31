"use client";

import React from "react";
import Link from "next/link";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState
} from "@tanstack/react-table";
import type { ServiceSummary } from "@marketplace/shared";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function formatSummaryPriceRange(priceRange: string): string {
  return priceRange === "Free" ? priceRange : `${priceRange} per call`;
}

function serviceAccessLabel(service: ServiceSummary): string {
  return service.serviceType === "marketplace_proxy" ? service.settlementLabel : service.accessModelLabel;
}

function servicePricingLabel(service: ServiceSummary): string {
  return service.serviceType === "marketplace_proxy"
    ? formatSummaryPriceRange(service.priceRange)
    : "Provider-defined";
}

function serviceTrafficLabel(service: ServiceSummary): string {
  return service.serviceType === "marketplace_proxy" ? String(service.totalCalls) : "Direct";
}

const columns: ColumnDef<ServiceSummary>[] = [
  {
    accessorKey: "name",
    header: "Service",
    cell: ({ row }) => {
      const service = row.original;

      return (
        <div>
          <div>{service.name}</div>
          <div>{service.tagline}</div>
        </div>
      );
    }
  },
  {
    accessorKey: "ownerName",
    header: "Provider"
  },
  {
    id: "access",
    header: "Access",
    accessorFn: serviceAccessLabel
  },
  {
    id: "pricing",
    header: "Pricing",
    accessorFn: servicePricingLabel
  },
  {
    accessorKey: "endpointCount",
    header: "Endpoints"
  },
  {
    id: "traffic",
    header: "Calls",
    accessorFn: serviceTrafficLabel
  },
  {
    id: "open",
    header: "Open",
    cell: ({ row }) => (
      <Link href={`/services/${row.original.slug}`}>
        View
      </Link>
    )
  }
];

export function ServicesDataTable({ services }: { services: ServiceSummary[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }]);

  const table = useReactTable({
    data: services,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const canSort = header.column.getCanSort();
              const sort = header.column.getIsSorted();

              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : canSort ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {String(flexRender(header.column.columnDef.header, header.getContext()))}
                      {sort === "asc" ? " ↑" : sort === "desc" ? " ↓" : ""}
                    </Button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length}>No services found.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
