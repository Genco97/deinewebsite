import { BRANCHE_INFO, type BrancheId } from "@/lib/beispiele";

export function vorschauLink(thema: string, branche: BrancheId, name: string) {
  const p = new URLSearchParams({ branche });
  if (name) p.set("name", name);
  return `/beispiele/${thema}?${p}`;
}

export function demoLink(
  paket: string,
  branche: BrancheId,
  name: string,
  design?: string,
) {
  const p = new URLSearchParams({
    paket,
    branche: BRANCHE_INFO[branche].label,
  });
  if (name) p.set("firma", name);
  if (design) p.set("design", design);
  return `/demo?${p}`;
}
