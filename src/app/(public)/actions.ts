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
    kontakt: fd.get("kontakt") === "on" ? "on" : "",
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
    einwilligung_kontakt: werte.kontakt === "on",
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
    // Wer einen Rückruf anfordert, willigt in diesen Anruf ein (Häkchen ist Pflicht)
    einwilligung_kontakt: true,
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

/** Rückmeldekarte (Postkarte mit QR-Code): Der Betrieb bittet selbst um einen Anruf. */
export async function karteBestaetigen(_vorher: FormStatus, fd: FormData): Promise<FormStatus> {
  const werte = {
    code: text(fd, "code", 20),
    name: text(fd, "name", 100),
    telefon: text(fd, "telefon", 50),
    zeit: text(fd, "zeit", 100),
  };

  if (istSpam(fd)) redirect("/danke?art=karte");

  const fehler: Fehler = {};
  if (!werte.name) fehler.name = "Bitte geben Sie Ihren Namen an.";
  if (werte.telefon && !istTelefon(werte.telefon)) fehler.telefon = "Bitte prüfen Sie die Telefonnummer.";
  if (fd.get("einwilligung") !== "on")
    fehler.einwilligung = "Bitte bestätigen Sie, dass wir Sie anrufen dürfen.";

  if (Object.keys(fehler).length > 0) {
    return { fehler, werte, meldung: "Bitte prüfen Sie die markierten Felder." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("karte_einwilligen", {
    p_code: werte.code,
    p_name: werte.name,
    p_telefon: werte.telefon,
    p_zeit: werte.zeit,
  });

  if (error) {
    console.error("Rückmeldekarte konnte nicht gespeichert werden", error.message);
    return {
      werte,
      meldung: "Ihre Rückmeldung konnte gerade nicht gesendet werden. Bitte versuchen Sie es noch einmal.",
    };
  }
  if (!data) {
    return {
      werte,
      meldung: "Diesen Karten-Code kennen wir nicht. Bitte prüfen Sie den Code auf der Karte.",
    };
  }

  redirect("/danke?art=karte");
}
