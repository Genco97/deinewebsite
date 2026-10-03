"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { istEmail, text, type Fehler } from "@/lib/validierung";

export type AuthStatus = { meldung?: string; ok?: boolean; fehler?: Fehler; email?: string };

function sichererPfad(p: string) {
  return p.startsWith("/crm") && !p.startsWith("//") ? p : "/crm";
}

export async function anmelden(_v: AuthStatus, fd: FormData): Promise<AuthStatus> {
  const email = text(fd, "email");
  const passwort = typeof fd.get("passwort") === "string" ? (fd.get("passwort") as string) : "";
  const weiter = sichererPfad(text(fd, "weiter", 300));

  if (!istEmail(email) || !passwort) {
    return { email, meldung: "Bitte gib E-Mail und Passwort ein." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: passwort });
  if (error) {
    const msg =
      error.code === "email_not_confirmed"
        ? "Bitte bestätige zuerst deine E-Mail-Adresse."
        : "E-Mail oder Passwort stimmt nicht.";
    return { email, meldung: msg };
  }
  redirect(weiter);
}

export async function registrieren(_v: AuthStatus, fd: FormData): Promise<AuthStatus> {
  const code = text(fd, "code", 50).toLowerCase();
  const name = text(fd, "name");
  const email = text(fd, "email");
  const passwort = typeof fd.get("passwort") === "string" ? (fd.get("passwort") as string) : "";

  const supabase = await createClient();

  // Code serverseitig prüfen – die Datenbank prüft beim Anlegen des Kontos ein zweites Mal.
  const { data: gueltig } = await supabase.rpc("einladungscode_gueltig", { code });
  if (!code || gueltig !== true) {
    return { meldung: "Dieser Einladungscode ist ungültig. Bitte frag die Person, die dich eingeladen hat." };
  }

  const fehler: Fehler = {};
  if (!name) fehler.name = "Bitte gib deinen Namen ein.";
  if (!istEmail(email)) fehler.email = "Bitte gib eine gültige E-Mail-Adresse ein.";
  if (passwort.length < 8) fehler.passwort = "Das Passwort muss mindestens 8 Zeichen haben.";
  if (Object.keys(fehler).length) return { fehler, email, meldung: "Bitte prüfe deine Eingaben." };

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password: passwort,
    options: {
      data: { invite_code: code, name },
      emailRedirectTo: `${site}/auth/callback?weiter=/crm`,
    },
  });

  if (error) {
    const msg =
      error.code === "user_already_exists"
        ? "Mit dieser E-Mail gibt es schon ein Konto. Melde dich einfach an."
        : "Die Registrierung hat nicht geklappt. Bitte prüfe den Einladungscode und versuch es nochmal.";
    return { email, meldung: msg };
  }

  if (data.session) redirect("/crm");

  return {
    ok: true,
    meldung: "Fast geschafft! Wir haben dir eine E-Mail geschickt. Bitte bestätige deine Adresse, dann kannst du dich anmelden.",
  };
}

export async function abmelden() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function passwortVergessen(_v: AuthStatus, fd: FormData): Promise<AuthStatus> {
  const email = text(fd, "email");
  if (!istEmail(email)) return { meldung: "Bitte gib eine gültige E-Mail-Adresse ein." };
  const supabase = await createClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  // Antwort immer gleich – verrät nicht, ob es die Adresse gibt
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${site}/auth/callback?weiter=${encodeURIComponent("/crm/profil?passwort=neu")}`,
  });
  return {
    ok: true,
    meldung: "Wenn es ein Konto mit dieser Adresse gibt, haben wir dir einen Link zum Zurücksetzen geschickt.",
  };
}
