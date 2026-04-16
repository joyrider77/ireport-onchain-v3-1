import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuthStore";
import { ArrowLeft, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Customer } from "../../backend.d";
import { KundeZeiterfassungsart } from "../../backend.d";
import { useActor, useMutation, useQuery, useQueryClient } from "./shared";

// ─── Form State ───────────────────────────────────────────────────────────────

interface KundeForm {
  // Tab: Kunde
  name: string;
  beschreibung: string;
  kundennummer: string;
  // Tab: Rechnungsadresse
  ra_zusatz1: string;
  ra_zusatz2: string;
  ra_strasse: string;
  ra_postfach: string;
  ra_plz: string;
  ra_ort: string;
  ra_land: string;
  // Tab: Kundeneinstellungen
  zeiterfassungsart: KundeZeiterfassungsart;
  waehrung: string;
  // Tab: Status
  aktiv: boolean;
}

const defaultForm: KundeForm = {
  name: "",
  beschreibung: "",
  kundennummer: "",
  ra_zusatz1: "",
  ra_zusatz2: "",
  ra_strasse: "",
  ra_postfach: "",
  ra_plz: "",
  ra_ort: "",
  ra_land: "Schweiz",
  zeiterfassungsart: KundeZeiterfassungsart.stuendlich,
  waehrung: "CHF",
  aktiv: true,
};

function customerToForm(c: Customer): KundeForm {
  return {
    name: c.name,
    beschreibung: c.beschreibung ?? "",
    kundennummer: c.kundennummer ?? "",
    ra_zusatz1: c.rechnungsadresse?.zusatz1 ?? "",
    ra_zusatz2: c.rechnungsadresse?.zusatz2 ?? "",
    ra_strasse: c.rechnungsadresse?.strasse ?? "",
    ra_postfach: c.rechnungsadresse?.postfach ?? "",
    ra_plz: c.rechnungsadresse?.plz ?? "",
    ra_ort: c.rechnungsadresse?.ort ?? "",
    ra_land: c.rechnungsadresse?.land ?? "Schweiz",
    zeiterfassungsart: c.zeiterfassungsart ?? KundeZeiterfassungsart.stuendlich,
    waehrung: c.waehrung ?? "CHF",
    aktiv: c.aktiv,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function KundenTab() {
  const { role } = useAuth();
  const canWrite = role === "admin" || role === "manager";
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();

  const [view, setView] = useState<"list" | "edit">("list");
  const [editItem, setEditItem] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [form, setForm] = useState<KundeForm>(defaultForm);
  const [nameError, setNameError] = useState("");
  const [activeTab, setActiveTab] = useState("kunde");

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: () => actor?.listCustomers() ?? Promise.resolve([]),
    enabled: !!actor && !isFetching,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const rechnungsadresse = {
        zusatz1: form.ra_zusatz1 || undefined,
        zusatz2: form.ra_zusatz2 || undefined,
        strasse: form.ra_strasse || undefined,
        postfach: form.ra_postfach || undefined,
        plz: form.ra_plz || undefined,
        ort: form.ra_ort || undefined,
        land: form.ra_land || "Schweiz",
      };
      const input = {
        name: form.name,
        beschreibung: form.beschreibung || undefined,
        kundennummer: form.kundennummer || undefined,
        rechnungsadresse,
        zeiterfassungsart: form.zeiterfassungsart,
        waehrung: form.waehrung || "CHF",
        aktiv: form.aktiv,
        contact: undefined,
        notes: undefined,
      };
      if (editItem) {
        const res = await actor.updateCustomer(editItem.id, input);
        if (res.__kind__ === "err") throw new Error(res.err);
        return res.ok;
      }
      const res = await actor.createCustomer(input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success(editItem ? "Kunde aktualisiert" : "Kunde erstellt");
      setView("list");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.deleteCustomer(id);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Kunde gelöscht");
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openAdd() {
    setEditItem(null);
    setForm(defaultForm);
    setNameError("");
    setActiveTab("kunde");
    setView("edit");
  }

  function openEdit(c: Customer) {
    setEditItem(c);
    setForm(customerToForm(c));
    setNameError("");
    setActiveTab("kunde");
    setView("edit");
  }

  function handleSave() {
    if (!form.name.trim()) {
      setNameError("Pflichtfeld");
      setActiveTab("kunde");
      return;
    }
    setNameError("");
    saveMutation.mutate();
  }

  function sf<K extends keyof KundeForm>(field: K, value: KundeForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // ─── List View ────────────────────────────────────────────────────────────

  if (view === "list") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {customers.length} Kunden
          </p>
          {canWrite && (
            <Button
              data-ocid="kunden-add"
              onClick={openAdd}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Kunden hinzufügen
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Name</TableHead>
                  <TableHead>Kundennummer</TableHead>
                  <TableHead>Zeiterfassung</TableHead>
                  <TableHead>Status</TableHead>
                  {canWrite && (
                    <TableHead className="text-right">Aktionen</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canWrite ? 5 : 4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Keine Kunden vorhanden
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((c) => (
                    <TableRow
                      key={String(c.id)}
                      data-ocid="kunden-row"
                      className={!c.aktiv ? "opacity-50" : ""}
                    >
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.kundennummer ?? "–"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {c.zeiterfassungsart === KundeZeiterfassungsart.block
                          ? "Block"
                          : "Stündlich"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.aktiv ? "default" : "secondary"}>
                          {c.aktiv ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </TableCell>
                      {canWrite && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(c)}
                              aria-label="Bearbeiten"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(c)}
                              aria-label="Löschen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Delete Confirmation */}
        <Dialog
          open={!!deleteTarget}
          onOpenChange={() => setDeleteTarget(null)}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Kunde löschen</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Möchten Sie <strong>{deleteTarget?.name}</strong> wirklich
              löschen?
            </p>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTarget(null)}
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                variant="destructive"
                data-ocid="kunden-delete-confirm"
                onClick={() =>
                  deleteTarget && deleteMutation.mutate(deleteTarget.id)
                }
                disabled={deleteMutation.isPending}
              >
                Löschen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ─── Edit View ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setView("list")}
          className="gap-2 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </Button>
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-lg font-semibold truncate">
            {editItem ? editItem.name : "Neuer Kunde"}
          </h2>
          {editItem && (
            <Badge variant={editItem.aktiv ? "default" : "secondary"}>
              {editItem.aktiv ? "Aktiv" : "Inaktiv"}
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="kunde" data-ocid="tab-kunde">
            Kunde
          </TabsTrigger>
          <TabsTrigger
            value="rechnungsadresse"
            data-ocid="tab-rechnungsadresse"
          >
            Rechnungsadresse
          </TabsTrigger>
          <TabsTrigger value="einstellungen" data-ocid="tab-einstellungen">
            Kundeneinstellungen
          </TabsTrigger>
          <TabsTrigger value="status" data-ocid="tab-status">
            Status
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Kunde ── */}
        <TabsContent value="kunde" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="k-name">Name *</Label>
              <Input
                id="k-name"
                data-ocid="kunden-name"
                value={form.name}
                onChange={(e) => sf("name", e.target.value)}
                disabled={!canWrite}
                className={nameError ? "border-destructive" : ""}
              />
              {nameError && (
                <p className="text-xs text-destructive">{nameError}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="k-kundennummer">Kundennummer</Label>
              <Input
                id="k-kundennummer"
                data-ocid="kunden-kundennummer"
                value={form.kundennummer}
                onChange={(e) => sf("kundennummer", e.target.value)}
                disabled={!canWrite}
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="k-beschreibung">Beschreibung</Label>
            <Textarea
              id="k-beschreibung"
              data-ocid="kunden-beschreibung"
              value={form.beschreibung}
              onChange={(e) => sf("beschreibung", e.target.value)}
              disabled={!canWrite}
              rows={3}
              placeholder="Optional"
            />
          </div>
          {canWrite && (
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="gap-2"
                data-ocid="kunden-save"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? "Speichern..." : "Speichern"}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ── Tab 2: Rechnungsadresse ── */}
        <TabsContent value="rechnungsadresse" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="ra-zusatz1">Zusatz 1</Label>
              <Input
                id="ra-zusatz1"
                data-ocid="kunden-ra-zusatz1"
                value={form.ra_zusatz1}
                onChange={(e) => sf("ra_zusatz1", e.target.value)}
                disabled={!canWrite}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ra-zusatz2">Zusatz 2</Label>
              <Input
                id="ra-zusatz2"
                data-ocid="kunden-ra-zusatz2"
                value={form.ra_zusatz2}
                onChange={(e) => sf("ra_zusatz2", e.target.value)}
                disabled={!canWrite}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="ra-strasse">Strasse</Label>
              <Input
                id="ra-strasse"
                data-ocid="kunden-ra-strasse"
                value={form.ra_strasse}
                onChange={(e) => sf("ra_strasse", e.target.value)}
                disabled={!canWrite}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ra-postfach">Postfach</Label>
              <Input
                id="ra-postfach"
                data-ocid="kunden-ra-postfach"
                value={form.ra_postfach}
                onChange={(e) => sf("ra_postfach", e.target.value)}
                disabled={!canWrite}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ra-plz">PLZ</Label>
              <Input
                id="ra-plz"
                data-ocid="kunden-ra-plz"
                value={form.ra_plz}
                onChange={(e) => sf("ra_plz", e.target.value)}
                disabled={!canWrite}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ra-ort">Ort</Label>
              <Input
                id="ra-ort"
                data-ocid="kunden-ra-ort"
                value={form.ra_ort}
                onChange={(e) => sf("ra_ort", e.target.value)}
                disabled={!canWrite}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ra-land">Land</Label>
              <Input
                id="ra-land"
                data-ocid="kunden-ra-land"
                value={form.ra_land}
                onChange={(e) => sf("ra_land", e.target.value)}
                disabled={!canWrite}
              />
            </div>
          </div>
          {canWrite && (
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="gap-2"
                data-ocid="kunden-save-ra"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? "Speichern..." : "Speichern"}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ── Tab 3: Kundeneinstellungen ── */}
        <TabsContent value="einstellungen" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="ke-zeiterfassung">Zeiterfassungsart</Label>
              <Select
                value={form.zeiterfassungsart}
                onValueChange={(v) =>
                  sf("zeiterfassungsart", v as KundeZeiterfassungsart)
                }
                disabled={!canWrite}
              >
                <SelectTrigger
                  id="ke-zeiterfassung"
                  data-ocid="kunden-zeiterfassungsart"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={KundeZeiterfassungsart.stuendlich}>
                    Stündlich
                  </SelectItem>
                  <SelectItem value={KundeZeiterfassungsart.block}>
                    Block (Von / Bis)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ke-waehrung">Währung</Label>
              <Input
                id="ke-waehrung"
                data-ocid="kunden-waehrung"
                value={form.waehrung}
                onChange={(e) => sf("waehrung", e.target.value)}
                disabled={!canWrite}
                placeholder="CHF"
              />
            </div>
          </div>
          {canWrite && (
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="gap-2"
                data-ocid="kunden-save-einst"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? "Speichern..." : "Speichern"}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ── Tab 4: Status ── */}
        <TabsContent value="status" className="mt-4">
          <div className="rounded-lg border border-border p-6 space-y-4">
            <h3 className="font-medium">Kundenstatus</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {form.aktiv ? "Aktiv" : "Inaktiv"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {form.aktiv
                    ? "Der Kunde ist aktiv und wird in der Zeiterfassung angezeigt."
                    : "Der Kunde ist inaktiv und wird in der Zeiterfassung ausgeblendet."}
                </p>
              </div>
              {canWrite && (
                <Switch
                  checked={form.aktiv}
                  onCheckedChange={(checked) => sf("aktiv", checked)}
                  data-ocid="kunden-status-toggle"
                />
              )}
            </div>
            {canWrite && (
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="gap-2"
                  data-ocid="kunden-save-status"
                >
                  <Save className="w-4 h-4" />
                  {saveMutation.isPending ? "Speichern..." : "Speichern"}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
