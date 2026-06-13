import { a as useNavigate, r as reactExports, j as jsxRuntimeExports } from "./index-D_yjRFGt.js";
import { d as useAuth } from "./useAuthStore-RPelH0kd.js";
function LogoutPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
      } catch (_err) {
      } finally {
        try {
          localStorage.removeItem("ireport-auth");
        } catch (_e) {
        }
        navigate({ to: "/" });
      }
    };
    void performLogout();
  }, [logout, navigate]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-lg", children: "Du wirst abgemeldet…" }) });
}
export {
  LogoutPage as default
};
