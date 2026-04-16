import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import { useAuth } from "./useAuthStore";

// Helper: cast actor to allow dynamic method calls (backend interface is empty at bindgen time)
type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

// ─── Auth / Registration ──────────────────────────────────────────────────────

export function useIsRegistered() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<boolean>({
    queryKey: ["isRegistered"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        const result = await toAny(actor).isRegistered();
        return result as boolean;
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 30_000,
  });
}

export function useMyCompany() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated, companyId } = useAuth();

  return useQuery({
    queryKey: ["myCompany", companyId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await toAny(actor).getMyCompany();
        return result ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && !!companyId,
    staleTime: 60_000,
  });
}

export function useMyEmployee() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated, employeeId } = useAuth();

  return useQuery({
    queryKey: ["myEmployee", employeeId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await toAny(actor).getMyEmployee();
        return result ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && !!employeeId,
    staleTime: 60_000,
  });
}

export function useDashboardStats() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated, companyId } = useAuth();

  return useQuery({
    queryKey: ["dashboardStats", companyId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await toAny(actor).getDashboardStats();
        return result ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && !!companyId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
