import { vorlageFuellen } from "@/lib/vorlagen";

export type WaVorlage = { id: string; titel: string; text: string };

/** Nummer für wa.me: nur Ziffern, mit Landesvorwahl (0660 … → 43660 …). Leer, wenn es keine brauchbare Nummer ist. */
export function waNummer(telefon: string | null | undefined) {
  const t = (telefon ?? "").trim();
  if (!t) return "";
  const z = t.replace(/\D/g, "");
  let n = z;
  if (t.startsWith("+")) n = z;
  else if (t.startsWith("00")) n = z.slice(2);
  else if (z.startsWith("0")) n = `43${z.slice(1)}`;
  return n.length >= 8 && n.length <= 15 ? n : "";
}

export function waLink(telefon: string | null | undefined, text: string) {
  const n = waNummer(telefon);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}

/** Welche Vorlage passt zur Situation? Sucht über den Titel, damit umbenannte Vorlagen nicht stören. */
export type WaAnlass = "gespraech" | "nicht_erreicht" | "demo";
const SUCHE: Record<WaAnlass, RegExp> = { gespraech: /gespr|besuch|danke/i, nicht_erreicht: /erreicht/i, demo: /demo/i };
export function passendeVorlage(vorlagen: WaVorlage[], anlass: WaAnlass) {
  return vorlagen.find((v) => SUCHE[anlass].test(v.titel)) ?? vorlagen[0] ?? null;
}

export function waTextFuellen(text: string, lead: { firma: string; ansprechpartner: string | null }, werte: { site: string; meinName: string; website?: string }) {
  return vorlageFuellen(text, {
    anrede: lead.ansprechpartner ? `Guten Tag ${lead.ansprechpartner}` : "Guten Tag",
    firma: lead.firma,
    ansprechpartner: lead.ansprechpartner ?? "",
    mein_name: werte.meinName,
    demo_link: `${werte.site}/demo`,
    website: werte.website ?? "[Link einfügen]",
  });
}
