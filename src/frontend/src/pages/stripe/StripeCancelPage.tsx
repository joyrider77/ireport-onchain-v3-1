import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { Layout } from "../../components/Layout";

export default function StripeCancelPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 max-w-md mx-auto">
        <div className="rounded-full bg-muted p-5 mb-6">
          <XCircle className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">
          Vorgang abgebrochen
        </h1>
        <p className="text-muted-foreground text-center text-sm mb-8">
          Der Zahlungsvorgang wurde abgebrochen. Dein aktueller Plan bleibt
          unverändert.
        </p>

        <div className="flex gap-3 flex-wrap justify-center">
          <Button
            type="button"
            onClick={() => navigate({ to: "/einstellungen" })}
            data-ocid="stripe-cancel.settings_button"
          >
            Zurück zu den Einstellungen
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/dashboard" })}
            data-ocid="stripe-cancel.dashboard_button"
          >
            Zum Dashboard
          </Button>
        </div>
      </div>
    </Layout>
  );
}
