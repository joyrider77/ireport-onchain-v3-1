import { TimeEntryDialog } from "@/components/TimeEntryDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStopwatch } from "@/context/StopwatchContext";
import { RefreshCw, Square, Timer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatElapsed(elapsedMs: number): string {
  const totalSec = Math.floor(elapsedMs / 1000);
  const hh = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StopwatchWidget() {
  const { isRunning, elapsedMs, start, stop, reset, getHHMM } = useStopwatch();
  const hasTime = elapsedMs > 0;
  const displayTime = formatElapsed(elapsedMs);

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  function handleStop() {
    // Stop the timer, then open the save dialog
    stop();
    setSaveDialogOpen(true);
  }

  function handleReset() {
    reset();
  }

  function handleCopyTime() {
    const hhmm = getHHMM();
    navigator.clipboard.writeText(hhmm).then(
      () => toast.success(`Zeit ${hhmm} in Zwischenablage kopiert`),
      () => toast.info(`Erfasste Zeit: ${hhmm}`),
    );
  }

  function handleSaved() {
    // Reset stopwatch after successful save
    reset();
    setSaveDialogOpen(false);
  }

  function handleDialogChange(open: boolean) {
    setSaveDialogOpen(open);
    // If the user closes without saving, the stopwatch stays stopped with time preserved
  }

  return (
    <>
      <div
        className="flex items-center gap-1.5 bg-muted/50 border border-border rounded-lg px-2.5 py-1.5"
        data-ocid="stopwatch-widget"
      >
        {/* Icon + display */}
        <Timer
          className={`w-3.5 h-3.5 flex-shrink-0 ${isRunning ? "text-emerald-500 animate-pulse" : "text-muted-foreground"}`}
        />
        <span
          className={`text-sm font-mono tabular-nums font-semibold min-w-[68px] text-center select-none ${
            isRunning
              ? "text-emerald-600 dark:text-emerald-400"
              : hasTime
                ? "text-foreground"
                : "text-muted-foreground"
          }`}
          data-ocid="stopwatch-display"
        >
          {displayTime}
        </span>

        {/* Start / Stop */}
        {!isRunning ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                onClick={start}
                aria-label="Stoppuhr starten"
                data-ocid="stopwatch-start-btn"
              >
                <Timer className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Stoppuhr starten</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleStop}
                aria-label="Stoppuhr stoppen"
                data-ocid="stopwatch-stop-btn"
              >
                <Square className="w-3 h-3 fill-current" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Stoppen &amp; Zeit erfassen
            </TooltipContent>
          </Tooltip>
        )}

        {/* Copy + Reset — shown when stopped with time */}
        {hasTime && !isRunning && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setSaveDialogOpen(true)}
                  aria-label="Zeit erfassen"
                  data-ocid="stopwatch-save-btn"
                >
                  <span className="text-[10px] font-bold leading-none">
                    +Zeit
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Zeit erfassen</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={handleCopyTime}
                  aria-label="Zeit kopieren"
                  data-ocid="stopwatch-copy-btn"
                >
                  <span className="text-[10px] font-bold leading-none">
                    hh:mm
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {getHHMM()} in Zwischenablage kopieren
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={handleReset}
                  aria-label="Stoppuhr zurücksetzen"
                  data-ocid="stopwatch-reset-btn"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Zurücksetzen</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>

      {/* Save dialog — opened when stopping or clicking +Zeit */}
      <TimeEntryDialog
        open={saveDialogOpen}
        onOpenChange={handleDialogChange}
        title="Zeit erfassen"
        initialValues={{ hours: getHHMM() }}
        onSaved={handleSaved}
      />
    </>
  );
}
