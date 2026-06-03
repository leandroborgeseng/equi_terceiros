"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getPendingUploads } from "@/lib/offline-queue";
import { syncPendingUploads } from "@/lib/offline-sync";
import { RefreshCw } from "lucide-react";

export function OfflineSyncBar() {
  const [count, setCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const pending = await getPendingUploads();
    setCount(pending.length);
  }, []);

  useEffect(() => {
    refresh();
    const onOnline = () => refresh();
    window.addEventListener("online", onOnline);
    const interval = setInterval(refresh, 8000);
    return () => {
      window.removeEventListener("online", onOnline);
      clearInterval(interval);
    };
  }, [refresh]);

  async function handleSync() {
    setSyncing(true);
    setLastResult(null);
    try {
      const { synced, failed } = await syncPendingUploads();
      setLastResult(`${synced} enviado(s)${failed ? `, ${failed} falha(s)` : ""}`);
      await refresh();
    } catch {
      setLastResult("Erro ao sincronizar");
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    const onOnline = () => {
      if (navigator.onLine) handleSync();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (count === 0 && !lastResult) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <span>
        {count > 0
          ? `${count} arquivo(s) na fila offline`
          : lastResult ?? "Sincronização concluída"}
      </span>
      {count > 0 && (
        <Button size="sm" variant="outline" onClick={handleSync} disabled={syncing || !navigator.onLine}>
          <RefreshCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
          Sincronizar
        </Button>
      )}
    </div>
  );
}
