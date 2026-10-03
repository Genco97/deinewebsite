"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { istPaket } from "@/lib/pakete";
import { istEmail, istTelefon, text, type Fehler } from "@/lib/validierung";

export type FormStatus = {
  ok?: boolean;
  meldung?: string;
  fehler?: Fehler;
  werte?: Record<string, string>;
};

/** Honeypot: echte Besucher sehen das Feld nicht. Bots füllen es aus. */
function istSpam(fd: FormData) {
  return text(fd, "website").length > 0;
}

export async function demoAnfordern(_vorher: FormStatus, fd: FormData): Promise<FormStatus> {
  const paketRoh = text(fd, "paket", 20);
  const paket = istPaket(paketRoh) ? paketRoh : "business";
  const art = paket === "premium" ? "beratung" : "demo";

  const werte = {
    firma: text(fd, "firma"),
    name: text(fd, "name"),
    email: text(fd, "email"),
    telefon: text(fd, "telefon", 50),
    branche: text(fd, "branche"),
    wuensche: text(fd, "wuensche", 4000),
  };

  if (istSpam(fd)) redirect(`/danke?art=${art}`);

  const fehler: Fehler = {};
  if (!werte.firma) fehler.firma = "Bitte geben Sie den Namen Ihres Betriebs an.";
  if (!werte.name) fehler.name = "Bitte geben Sie Ihren Namen an.";
  if (!istEmail(werte.email)) fehler.email = "Bitte geben Sie eine gültige E-Mail-Adresse an.";
  if (werte.telefon && !istTelefon(werte.telefon))
    fehler.telefon = "Bitte prüfen Sie die Telefonnummer.";
  if (fd.get("agb") !== "on") fehler.agb = "Bitte bestätigen Sie die AGB und die Datenschutzerklärung.";

  if (Object.keys(fehler).length > 0) {
    return { fehler, werte, meldung: "Bitte prüfen Sie die markierten Felder." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("anfragen").insert({
    art,
    paket,
    firma: werte.firma,
    name: werte.name,
    email: werte.email,
    telefon: werte.telefon || null,
    branche: werte.branche || null,
    wuensche: werte.wuensche || null,
  });

  if (error) {
    console.error("Anfrage konnte nicht gespeichert werden", error.message);
    return {
      werte,
      meldung:
        "Ihre Anfrage konnte gerade nicht gesendet werden. Bitte versuchen Sie es noch einmal oder rufen Sie uns an.",
    };
  }

  redirect(`/danke?art=${art}`);
}

export async function rueckrufAnfordern(_vorher: FormStatus, fd: FormData): Promise<FormStatus> {
  const werte = {
    name: text(fd, "name"),
    telefon: text(fd, "telefon", 50),
    firma: text(fd, "firma"),
    wuensche: text(fd, "wuensche", 1000),
  };

  if (istSpam(fd)) redirect("/danke?art=rueckruf");

  const fehler: Fehler = {};
  if (!werte.name) fehler.name = "Bitte geben Sie Ihren Namen an.";
  if (!istTelefon(werte.telefon)) fehler.telefon = "Bitte geben Sie eine gültige Telefonnummer an.";
  if (fd.get("datenschutz") !== "on")
    fehler.datenschutz = "Bitte bestätigen Sie die Datenschutzerklärung.";

  if (Object.keys(fehler).length > 0) {
    return { fehler, werte, meldung: "Bitte prüfen Sie die markierten Felder." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("anfragen").insert({
    art: "rueckruf",
    name: werte.name,
    telefon: werte.telefon,
    firma: werte.firma || null,
    wuensche: werte.wuensche || null,
  });

  if (error) {
    console.error("Rückruf konnte nicht gespeichert werden", error.message);
    return {
      werte,
      meldung: "Ihre Anfrage konnte gerade nicht gesendet werden. Bitte versuchen Sie es noch einmal.",
    };
  }

  redirect("/danke?art=rueckruf");
}
