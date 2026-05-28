"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

export default function FornecedorDashboardPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Portal do Fornecedor</h1>
      <Card>
        <CardHeader>
          <CardTitle>Envio de documentação</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          <p>O fornecedor recebe um link exclusivo gerado na solicitação médica.</p>
          <p className="mt-4 flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Formato: /fornecedor/[token]
          </p>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 font-mono text-xs">
            Demo: /fornecedor/demotoken123456
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
