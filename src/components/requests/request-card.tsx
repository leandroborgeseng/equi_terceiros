"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Building2, Stethoscope, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RequestStatusBadge } from "./status-badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { RequestStatus } from "@/lib/enums";

export type RequestCardData = {
  id: string;
  protocol: string;
  status: RequestStatus;
  equipmentName: string;
  brand: string;
  model: string;
  usageSector: string;
  supplierName: string;
  doctor: { name: string };
  plannedDate: string;
  plannedTime: string;
  isUrgent: boolean;
  validUntil?: string | null;
};

export function RequestCard({ request, href }: { request: RequestCardData; href: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Link href={href}>
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs text-slate-500">{request.protocol}</p>
                <h3 className="font-semibold text-slate-900">
                  {request.equipmentName} — {request.brand} {request.model}
                </h3>
              </div>
              <RequestStatusBadge status={request.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Stethoscope className="h-3 w-3" /> {request.doctor.name}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {request.usageSector}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(request.plannedDate)} {request.plannedTime}
              </span>
              <span>{request.supplierName}</span>
            </div>
            {request.isUrgent && (
              <div className="flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertTriangle className="h-3 w-3" /> Urgência / Emergência
              </div>
            )}
            {request.validUntil && (
              <p className="text-xs text-amber-700">
                Validade: {formatDateTime(request.validUntil)}
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
