import "./index-Blf-A8DR.js";
import { u as useActor$1, c as createActor } from "./useAuthStore-Cbv7GIMf.js";
function useActor() {
  const { actor, isFetching } = useActor$1(createActor);
  const typedActor = actor ? actor : null;
  return { actor: typedActor, isFetching };
}
function getRoleLabel(role) {
  if (role === "admin") return "Administrator";
  if (role === "manager") return "Manager";
  return "Mitarbeiter";
}
function minutesToHhMm(totalMinutes) {
  const h = Math.floor(Math.abs(totalMinutes) / 60);
  const m = Math.abs(totalMinutes) % 60;
  const sign = totalMinutes < 0 ? "-" : "";
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function hhmmToMinutes(input) {
  const trimmed = input.trim();
  const match = trimmed.match(/^(\d{1,3}):([0-5]\d)$/);
  if (!match) return null;
  return Number.parseInt(match[1], 10) * 60 + Number.parseInt(match[2], 10);
}
function bigintToHhMm(minutes) {
  return minutesToHhMm(Number(minutes));
}
function minutesToHhhMm(totalMinutes) {
  const sign = totalMinutes < 0 ? "-" : "";
  const abs = Math.abs(totalMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const hStr = h < 100 ? String(h).padStart(3, "0") : String(h);
  return `${sign}${hStr}:${String(m).padStart(2, "0")}`;
}
function hhhmmToMinutes(input) {
  const trimmed = input.trim();
  const match = trimmed.match(/^(\d{1,6}):([0-5]\d)$/);
  if (!match) return null;
  return Number.parseInt(match[1], 10) * 60 + Number.parseInt(match[2], 10);
}
function dateToTimestamp(dateStr) {
  if (!dateStr) return BigInt(0);
  const d = /* @__PURE__ */ new Date(`${dateStr}T00:00:00`);
  return BigInt(Math.floor(d.getTime() / 1e3));
}
function timestampToDate(ts) {
  if (!ts || ts === BigInt(0)) return "";
  const d = new Date(Number(ts) * 1e3);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function formatVacationDays(dauer) {
  const days = Number(dauer) / 100;
  return days % 1 === 0 ? `${days}` : days.toFixed(1);
}
function parseVacationDays(input) {
  const val = Number.parseFloat(input);
  if (!Number.isFinite(val) || val < 0) return null;
  return BigInt(Math.round(val * 100));
}
export {
  hhhmmToMinutes as a,
  bigintToHhMm as b,
  minutesToHhhMm as c,
  dateToTimestamp as d,
  formatVacationDays as f,
  getRoleLabel as g,
  hhmmToMinutes as h,
  minutesToHhMm as m,
  parseVacationDays as p,
  timestampToDate as t,
  useActor as u
};
