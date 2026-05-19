import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { createActor } from "../../backend";

function formatTimestamp(ns?: bigint): string {
  if (!ns || ns === 0n) return "—";
  const ms = Number(ns / 1_000_000n);
  const d = new Date(ms);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

interface StripeSyncStatusProps {
  companyId: bigint;
  lastSyncAt?: bigint;
  dataSource?: string;
  queryKeysToInvalidate?: string[][];
}

export function StripeSyncStatus({
  companyId,
  lastSyncAt,
  dataSource,
  queryKeysToInvalidate = [],
}: StripeSyncStatusProps) {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const result = await actor.syncStripeSubscription(companyId);
      if (result.__kind__ === "err") throw new Error(result.err ?? "Fehler");
      return result.ok;
    },
    onSuccess: () => {
      toast.success("Stripe-Synchronisation abgeschlossen.");
      for (const key of queryKeysToInvalidate) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      queryClient.invalidateQueries({
        queryKey: ["companySubscriptionDetail"],
      });
    },
    onError: (err: Error) => {
      toast.error(`Sync-Fehler: ${err.message}`);
    },
  });

  const isLive = dataSource === "live" || !dataSource;

  return (
    <div
      className="flex items-center gap-3 flex-wrap"
      data-ocid="billing.sync_status"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          className={`inline-flex w-2 h-2 rounded-full flex-shrink-0 ${
            isLive ? "bg-green-500" : "bg-yellow-400"
          }`}
        />
        <span>{isLive ? "Live" : "Manuell"}</span>
        {lastSyncAt && lastSyncAt > 0n && (
          <span className="hidden sm:inline">
            · Letzter Sync: {formatTimestamp(lastSyncAt)}
          </span>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 text-xs gap-1.5"
        disabled={syncMutation.isPending}
        onClick={() => syncMutation.mutate()}
        data-ocid="billing.sync_button"
      >
        <RefreshCw
          className={`w-3 h-3 ${syncMutation.isPending ? "animate-spin" : ""}`}
        />
        {syncMutation.isPending ? "Synchronisiert…" : "Jetzt synchronisieren"}
      </Button>
    </div>
  );
}
