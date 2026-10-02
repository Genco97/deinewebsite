export type Fehler = Record<string, string>;

export function text(fd: FormData, name: string, max = 200): string {
  const v = fd.get(name);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function istEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

export function istTelefon(v: string) {
  return /^[+0-9 ()/-]{6,30}$/.test(v);
}
