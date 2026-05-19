import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportMenu() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled
      data-ocid="export-menu-button"
      className="text-muted-foreground"
    >
      <Download className="w-4 h-4 mr-1.5" />
      Exportieren
    </Button>
  );
}
