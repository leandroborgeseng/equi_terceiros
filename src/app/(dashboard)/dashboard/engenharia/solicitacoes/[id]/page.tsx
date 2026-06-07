"use client";

import { useParams } from "next/navigation";
import { RequestDetailView } from "@/components/ec/request-detail-view";

export default function EngenhariaRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <RequestDetailView requestId={id} />;
}
