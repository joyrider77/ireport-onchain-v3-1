import { useAuth } from "@/hooks/useAuthStore";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export default function LogoutPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
      } catch (_err) {
        // Ignore errors during logout — always clean up
      } finally {
        // Belt-and-suspenders: clear the persisted Zustand store key
        try {
          localStorage.removeItem("ireport-auth");
        } catch (_e) {
          // ignore
        }
        navigate({ to: "/" });
      }
    };

    void performLogout();
  }, [logout, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground text-lg">Du wirst abgemeldet…</p>
    </div>
  );
}
