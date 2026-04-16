import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppRole = "admin" | "manager" | "employee" | null;

interface AuthState {
  isAuthenticated: boolean;
  principal: string | null;
  role: AppRole;
  companyId: string | null;
  employeeId: string | null;
  companyName: string | null;
  companyLogoUrl: string | null;
  employeeName: string | null;
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
      }),
    },
  ),
);

// Hook that combines II identity with auth store
export function useAuth() {
  const { identity, login, clear, isLoginSuccess } = useInternetIdentity();
  const queryClient = useQueryClient();
  const store = useAuthStore();

  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    store.logout();
    queryClient.clear();
  };

  return {
    identity,
    isAuthenticated,
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
    isLoading: store.isLoading,
    setAuthenticated: store.setAuthenticated,
    setCompanyLogo: store.setCompanyLogo,
    setLoading: store.setLoading,
  };
}
