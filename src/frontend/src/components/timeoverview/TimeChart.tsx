import { formatHours } from "@/lib/timeFormat";
import type { PeriodData, PeriodType } from "@/lib/timeOverviewAggregation";
import type { DotProps } from "recharts";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Colors ───────────────────────────────────────────────────────────────────

const COLORS = {
  arbeitszeit: "#B3D9FF",
  ferien: "#B3E6C8",
  abwesenheit: "#E8E8E8",
  feiertag: "#FFD6CC",
  sollzeit: "#9CA3AF",
} as const;

// ─── Custom square dot for Sollzeit line ──────────────────────────────────────

function SquareDot(props: DotProps & { value?: number }) {
  const { cx, cy, value } = props;
  if (typeof cx !== "number" || typeof cy !== "number" || !value) return null;
  return (
    <rect
      x={cx - 3}
      y={cy - 3}
      width={6}
      height={6}
      fill={COLORS.sollzeit}
      stroke={COLORS.sollzeit}
    />
  );
}

const CHART_TICK = { fontSize: 11, fill: "oklch(0.5 0.015 220)" };

const TOOLTIP_STYLE = {
  borderRadius: "6px",
  border: "1px solid oklch(0.92 0.02 255)",
  fontSize: 12,
  background: "oklch(1.0 0 0)",
  color: "oklch(0.25 0.02 250)",
};

// ─── Tooltip formatter ────────────────────────────────────────────────────────

const LABEL_MAP: Record<string, string> = {
  istArbeitszeit: "Arbeitszeit",
  istFerien: "Ferien",
  istAbwesenheit: "Abwesenheit",
  istFeiertag: "Feiertag",
  sollzeit: "Sollzeit",
};

function tooltipFormatter(value: number, name: string) {
  return [formatHours(value), LABEL_MAP[name] ?? name];
}

function legendFormatter(value: string) {
  return LABEL_MAP[value] ?? value;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  data: PeriodData[];
  periodType: PeriodType;
  onBarClick?: (date: Date) => void;
}

export function TimeChart({ data, periodType, onBarClick }: Props) {
  function handleBarClick(entry: { dateFrom?: string; dateTo?: string }) {
    if (!onBarClick) return;
    const isoDate = entry.dateFrom ?? entry.dateTo ?? "";
    if (!isoDate) return;
    const d = new Date(`${isoDate}T12:00:00`);
    onBarClick(d);
  }
  if (periodType === "day") return null;

  const maxValue = Math.max(
    ...data.map(
      (d) => d.istArbeitszeit + d.istFerien + d.istAbwesenheit + d.istFeiertag,
    ),
    ...data.map((d) => d.sollzeit),
    1,
  );
  const yMax = maxValue * 1.2;

  return (
    <ResponsiveContainer width="100%" height={360}>
      <ComposedChart
        data={data}
        margin={{ top: 8, right: 16, bottom: 4, left: -8 }}
        data-ocid="time-chart"
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="oklch(0.92 0.02 255)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={CHART_TICK}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={CHART_TICK}
          axisLine={false}
          tickLine={false}
          domain={[0, yMax]}
          tickFormatter={(v: number) => (v === 0 ? "0" : `${v.toFixed(1)}h`)}
          width={44}
        />
        <Tooltip
          formatter={tooltipFormatter}
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ fontWeight: 600, marginBottom: 4 }}
        />
        <Legend formatter={legendFormatter} wrapperStyle={{ fontSize: 12 }} />

        {/* Stacked bars — onClick on the top layer triggers drill-down */}
        <Bar
          dataKey="istArbeitszeit"
          stackId="ist"
          fill={COLORS.arbeitszeit}
          stroke="#8EC8F0"
          strokeWidth={0.5}
          radius={[0, 0, 0, 0]}
          maxBarSize={56}
          data-ocid="chart-bar-arbeitszeit"
          onClick={(entry) =>
            handleBarClick(entry as { dateFrom?: string; dateTo?: string })
          }
          style={{ cursor: onBarClick ? "pointer" : "default" }}
        />
        <Bar
          dataKey="istFerien"
          stackId="ist"
          fill={COLORS.ferien}
          stroke="#8ECFAE"
          strokeWidth={0.5}
          maxBarSize={56}
          onClick={(entry) =>
            handleBarClick(entry as { dateFrom?: string; dateTo?: string })
          }
          style={{ cursor: onBarClick ? "pointer" : "default" }}
        />
        <Bar
          dataKey="istAbwesenheit"
          stackId="ist"
          fill={COLORS.abwesenheit}
          stroke="#D0D0D0"
          strokeWidth={0.5}
          maxBarSize={56}
          onClick={(entry) =>
            handleBarClick(entry as { dateFrom?: string; dateTo?: string })
          }
          style={{ cursor: onBarClick ? "pointer" : "default" }}
        />
        <Bar
          dataKey="istFeiertag"
          stackId="ist"
          fill={COLORS.feiertag}
          stroke="#EEB8AC"
          strokeWidth={0.5}
          radius={[3, 3, 0, 0]}
          maxBarSize={56}
          onClick={(entry) =>
            handleBarClick(entry as { dateFrom?: string; dateTo?: string })
          }
          style={{ cursor: onBarClick ? "pointer" : "default" }}
        />

        {/* Sollzeit line with square dots */}
        <Line
          type="monotone"
          dataKey="sollzeit"
          stroke={COLORS.sollzeit}
          strokeWidth={1.5}
          strokeDasharray="5 5"
          dot={<SquareDot />}
          activeDot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
