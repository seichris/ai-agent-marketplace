import { notFound } from "next/navigation";

import { ServicePage } from "@/components/service-page";
import { fetchServiceDetail } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await fetchServiceDetail(slug);

  if (!service) {
    notFound();
  }

  return <ServicePage service={service} />;
}
