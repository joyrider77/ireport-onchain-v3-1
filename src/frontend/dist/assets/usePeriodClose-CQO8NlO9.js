import { e as useQueryClient } from "./index-D_yjRFGt.js";
import { u as useActor, b as useQuery, c as createActor } from "./useAuthStore-RPelH0kd.js";
import { q as useMutation } from "./Layout-BOoVnXJI.js";
const toAny = (a) => a;
function useListPeriodCloses(companyId, month, year) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["periodCloses", companyId == null ? void 0 : companyId.toString(), month, year],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      try {
        const result = await toAny(actor).listPeriodCloses(
          companyId,
          BigInt(month),
          BigInt(year)
        );
        return result ?? [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!companyId && month > 0 && year > 0,
    retry: 2,
    staleTime: 3e4
  });
}
function useGetPeriodStatus(companyId, employeeId, month, year) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: [
      "periodStatus",
      companyId == null ? void 0 : companyId.toString(),
      employeeId == null ? void 0 : employeeId.toString(),
      month,
      year
    ],
    queryFn: async () => {
      if (!actor || !companyId || !employeeId) return null;
      try {
        const result = await toAny(actor).getPeriodCloseStatus(
          companyId,
          employeeId,
          BigInt(month),
          BigInt(year)
        );
        return result ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!companyId && !!employeeId && month > 0 && year > 0,
    retry: 2,
    staleTime: 3e4
  });
}
function useClosePeriod() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Nicht verbunden");
      const candid = {
        tenantId: BigInt(String(input.companyId)),
        employeeId: input.employeeId,
        month: BigInt(input.month),
        year: BigInt(input.year),
        closeComment: input.closeComment
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
    }
  });
}
function useReopenPeriod() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Nicht verbunden");
      const candid = {
        closeId: input.closeId,
        reopenReason: input.reopenReason
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
    }
  });
}
export {
  useClosePeriod as a,
  useReopenPeriod as b,
  useListPeriodCloses as c,
  useGetPeriodStatus as u
};
