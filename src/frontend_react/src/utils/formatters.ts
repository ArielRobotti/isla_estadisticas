export function fmt(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.round(n).toLocaleString('es-AR');
}

export function fmtMin(m: number | null | undefined): string {
  if (m == null || isNaN(m)) return '—';
  const v = Math.round(m);
  return v >= 60 ? (v / 60).toFixed(1) + 'h' : v + 'min';
}

export function fmtPct(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return '—';
  const p = v <= 1 ? v * 100 : v;
  return p.toFixed(1) + '%';
}

export function fmtLabel(ts: string | undefined, mode: string): string {
  if (!ts) return '?';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  if (mode === 'day' || mode === 'lifetime')
    return d.toLocaleDateString('es-AR', { month: 'short', day: 'numeric' });
  if (mode === 'hour')
    return d.toLocaleDateString('es-AR', { month: 'short', day: 'numeric' }) + ' ' + d.getHours() + ':00';
  // minute
  return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
}

export function sumArr(arr: { value: number | null }[] | undefined): number | null {
  if (!arr) return null;
  const v = arr.filter(e => e.value != null).map(e => Number(e.value));
  return v.length ? v.reduce((a, b) => a + b, 0) : null;
}

export function avgArr(arr: { value: number | null }[] | undefined): number | null {
  if (!arr) return null;
  const v = arr.filter(e => e.value != null).map(e => Number(e.value));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

export function maxArr(arr: { value: number | null }[] | undefined): number | null {
  if (!arr) return null;
  const v = arr.filter(e => e.value != null).map(e => Number(e.value));
  return v.length ? Math.max(...v) : null;
}

export function lastD(arr: { d1: number | null; d7: number | null }[] | undefined, key: 'd1' | 'd7'): number | null {
  if (!arr) return null;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i][key] != null) return arr[i][key];
  }
  return null;
}

export function extract(arr: { value: number | null, timestamp: string }[] | undefined, mode: string) {
  if (!arr || !arr.length) return { labels: [], values: [] };
  const f = arr.filter(e => e.value != null);
  return { labels: f.map(e => fmtLabel(e.timestamp, mode)), values: f.map(e => Number(e.value)) };
}
