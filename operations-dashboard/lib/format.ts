export function fmtDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar-AE",{timeZone:"Asia/Dubai",dateStyle:"medium",timeStyle:"short"}).format(new Date(value));
}
export function fmtTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar-AE",{timeZone:"Asia/Dubai",hour:"2-digit",minute:"2-digit"}).format(new Date(value));
}
export function number(value?: number | null){ return new Intl.NumberFormat("ar-AE").format(value ?? 0); }
export function truncate(value?: string | null,max=92){ if(!value) return "—"; return value.length>max?value.slice(0,max)+"…":value; }
