/**
 * useCompanyTimezone — fetches and caches the company's IANA timezone string.
 * Defaults to "Europe/Zurich" if not set or loading.
 */
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { CompanySettings } from "../backend.d";
import { useAuth } from "./useAuthStore";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

export const DEFAULT_TIMEZONE = "Europe/Zurich";

export function useCompanyTimezone(): string {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated, companyId } = useAuth();

  const { data } = useQuery<CompanySettings | null>({
    queryKey: ["companySettings", companyId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const res = await toAny(actor).getCompanySettings();
        const r = res as { __kind__: string; ok?: CompanySettings };
        return r.__kind__ === "ok" && r.ok ? r.ok : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && !!companyId,
    staleTime: 60_000,
  });

  return data?.timezone || DEFAULT_TIMEZONE;
}

/**
 * Convert a Date to a YYYY-MM-DD string using a specific IANA timezone.
 */
export function toDateStringInTz(date: Date, timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date); // sv-SE gives YYYY-MM-DD
  } catch {
    return date.toISOString().split("T")[0];
  }
}

/**
 * Format a date for display using company timezone.
 */
export function formatDateInTz(
  date: Date,
  timezone: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  try {
    return new Intl.DateTimeFormat("de-CH", {
      timeZone: timezone,
      ...options,
    }).format(date);
  } catch {
    return date.toLocaleDateString("de-CH", options);
  }
}
