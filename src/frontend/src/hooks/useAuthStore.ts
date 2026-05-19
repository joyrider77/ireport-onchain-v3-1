import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createActor } from "../backend";

export type AppRole =
  | "admin"
  | "manager"
  | "employee"
  | "platform_admin"
  | null;

interface AuthState {
  isAuthenticated: boolean;
  principal: string | null;
  role: AppRole;
  companyId: string | null;
  employeeId: string | null;
  companyName: string | null;
  companyLogoUrl: string | null;
  employeeName: string | null;
  isPlatformAdmin: boolean;
  isLoading: boolean;
  setAuthenticated: (
    principal: string,
    role: AppRole,
    companyId: string | null,
    employeeId: string | null,
    companyName: string | null,
    employeeName: string | null,
    companyLogoUrl?: string | null,
  ) => void;
  setCompanyLogo: (url: string | null) => void;
  setLoading: (loading: boolean) => void;
  setPlatformAdmin: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      principal: null,
      role: null,
      companyId: null,
      employeeId: null,
      companyName: null,
      companyLogoUrl: null,
      employeeName: null,
      isPlatformAdmin: false,
      isLoading: false,

      setAuthenticated: (
        principal,
        role,
        companyId,
        employeeId,
        companyName,
        employeeName,
        companyLogoUrl,
      ) =>
        set({
          isAuthenticated: true,
          principal,
          role,
          companyId,
          employeeId,
          companyName,
          employeeName,
          companyLogoUrl: companyLogoUrl ?? null,
          isLoading: false,
        }),

      setCompanyLogo: (url) => set({ companyLogoUrl: url }),

      setLoading: (loading) => set({ isLoading: loading }),

      setPlatformAdmin: (value) => set({ isPlatformAdmin: value }),

      logout: () =>
        set({
          isAuthenticated: false,
          principal: null,
          role: null,
          companyId: null,
          employeeId: null,
          companyName: null,
          companyLogoUrl: null,
          employeeName: null,
          isPlatformAdmin: false,
          isLoading: false,
        }),
    }),
    {
      name: "ireport-auth",
      partialize: (state) => ({
        role: state.role,
        companyId: state.companyId,
        employeeId: state.employeeId,
        companyName: state.companyName,
        companyLogoUrl: state.companyLogoUrl,
        employeeName: state.employeeName,
        isPlatformAdmin: state.isPlatformAdmin,
      }),
    },
  ),
);

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;

// Hook that combines II identity with auth store
export function useAuth() {
  const { identity, login, clear, isLoginSuccess } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const store = useAuthStore();

  // Identity is the source of truth for "is the user logged in via II"
  const hasIdentity = !!identity;

  // Track whether we've already run the on-mount active check for this session
  const activeCheckDone = useRef(false);

  // ── On-mount active check ────────────────────────────────────────────────
  // When the page loads with a cached II session + cached store data,
  // verify once that the employee is still active. If explicitly inactive,
  // force logout. Any network / canister error is ignored — fail open.
  useEffect(() => {
    if (!hasIdentity || !actor || actorFetching) return;
    if (activeCheckDone.current) return;

    // Only run if there is cached session data (user already registered)
    const { role, companyId } = useAuthStore.getState();
    if (!role || !companyId) return;

    activeCheckDone.current = true;

    const checkActive = async () => {
      try {
        type EmployeeResult =
          | { __kind__: "ok"; ok: { active: boolean } }
          | { __kind__: "err"; err: string };

        const result = (await (
          actor as unknown as AnyActor
        ).getMyEmployee()) as EmployeeResult;

        // Only block access if the backend explicitly says active === false.
        // Any error variant or thrown exception => fail open (let user continue).
        if (result.__kind__ === "ok" && result.ok.active === false) {
          await clear();
          useAuthStore.getState().logout();
          queryClient.clear();
          try {
            localStorage.removeItem("ireport-auth");
          } catch {
            // ignore
          }
          window.location.href = "/login";
        }
        // else: active=true or error variant => do nothing, let user in
      } catch {
        // Network / canister error — do not block the user
      }
    };

    void checkActive();
  }, [hasIdentity, actor, actorFetching, clear, queryClient]);

  // Reset active check ref when identity is lost (logout)
  useEffect(() => {
    if (!hasIdentity) {
      activeCheckDone.current = false;
    }
  }, [hasIdentity]);

  // ── isPlatformAdmin re-check ─────────────────────────────────────────────
  // Re-query isPlatformAdmin whenever actor becomes available and user is authenticated.
  // This ensures the Platform-Admin menu item appears correctly after login or page reload
  // without depending solely on the LoginPage flow.
  useEffect(() => {
    if (!actor || actorFetching || !hasIdentity) return;
    const checkPlatformAdmin = async () => {
      try {
        const isAdmin = (await (
          actor as unknown as Record<string, () => Promise<unknown>>
        ).isPlatformAdmin()) as boolean;
        // Use getState() to read/write without adding store to deps
        const { isPlatformAdmin: current, setPlatformAdmin } =
          useAuthStore.getState();
        if (isAdmin !== current) {
          setPlatformAdmin(isAdmin);
        }
      } catch {
        // Silently ignore — non-platform admins will get false
      }
    };
    void checkPlatformAdmin();
  }, [actor, actorFetching, hasIdentity]);

  const handleLogout = async () => {
    await clear();
    store.logout();
    queryClient.clear();
    try {
      localStorage.removeItem("ireport-auth");
    } catch {
      // ignore
    }
  };

  return {
    identity,
    isAuthenticated: hasIdentity,
    isLoginSuccess,
    login,
    logout: handleLogout,
    principal: store.principal,
    role: store.role,
    companyId: store.companyId,
    employeeId: store.employeeId,
    companyName: store.companyName,
    companyLogoUrl: store.companyLogoUrl,
    employeeName: store.employeeName,
    isPlatformAdmin: store.isPlatformAdmin,
    isLoading: store.isLoading,
    setAuthenticated: store.setAuthenticated,
    setCompanyLogo: store.setCompanyLogo,
    setLoading: store.setLoading,
    setPlatformAdmin: store.setPlatformAdmin,
  };
}
