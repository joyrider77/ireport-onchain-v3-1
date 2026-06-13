import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  ClosePeriodInput,
  PeriodClose,
  ReopenPeriodInput,
} from "../backend";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

export function useListPeriodCloses(
  companyId: bigint | undefined,
  month: number,
  year: number,
) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<PeriodClose[]>({
    queryKey: ["periodCloses", companyId?.toString(), month, year],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      try {
        const result = await toAny(actor).listPeriodCloses(
          companyId,
          BigInt(month),
          BigInt(year),
        );
        return (result as PeriodClose[]) ?? [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!companyId && month > 0 && year > 0,
    retry: 2,
    staleTime: 30_000,
  });
}

export function useGetPeriodStatus(
  companyId: bigint | undefined,
  employeeId: bigint | undefined,
  month: number,
  year: number,
) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<PeriodClose | null>({
    queryKey: [
      "periodStatus",
      companyId?.toString(),
      employeeId?.toString(),
      month,
      year,
    ],
    queryFn: async () => {
      if (!actor || !companyId || !employeeId) return null;
      try {
        const result = await toAny(actor).getPeriodCloseStatus(
          companyId,
          employeeId,
          BigInt(month),
          BigInt(year),
        );
        return (result as PeriodClose | null) ?? null;
      } catch {
        return null;
      }
    },
    enabled:
      !!actor &&
      !isFetching &&
      !!companyId &&
      !!employeeId &&
      month > 0 &&
      year > 0,
    retry: 2,
    staleTime: 30_000,
  });
}

export function useClosePeriod() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      companyId: bigint | string;
      employeeId?: bigint;
      month: number;
      year: number;
      closeComment?: string;
    }) => {
      if (!actor) throw new Error("Nicht verbunden");
      const candid: ClosePeriodInput = {
        tenantId: BigInt(String(input.companyId)),
        employeeId: input.employeeId,
        month: BigInt(input.month),
        year: BigInt(input.year),
        closeComment: input.closeComment,
      };
      const result = await actor.closePeriod(candid);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periodCloses"] });
      queryClient.invalidateQueries({ queryKey: ["periodStatus"] });
    },
  });
}

export function useReopenPeriod() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { closeId: string; reopenReason?: string }) => {
      if (!actor) throw new Error("Nicht verbunden");
      const candid: ReopenPeriodInput = {
        closeId: input.closeId,
        reopenReason: input.reopenReason,
      };
      const result = await actor.reopenPeriod(candid);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periodCloses"] });
      queryClient.invalidateQueries({ queryKey: ["periodStatus"] });
    },
  });
}
