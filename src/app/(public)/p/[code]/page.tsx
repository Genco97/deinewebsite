import type { Metadata } from "next";
import Link from "next/link";
import { KundenRueckmeldung } from "@/components/public/KundenRueckmeldung";
import { Karte, buttonClass } from "@/components/ui";
import { PAKET_NAMEN, istPaket } from "@/lib/pakete";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Ihr Projekt",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type Projekt = {
  firma: string;
  paket: string;
  phase: "inhalte" | "umsetzung" | "freigabe" | "online";
  faellig: string | null;
  website_url: string | null;
  seit: string;
  betreuer: string | null;
  erreicht: Partial<Record<"umsetzung" | "freigabe" | "online", string | null>>;
  rueckmeldungen: { art: "passt" | "aendern"; text: string | null; am: string }[];
};

const DATUM = new Intl.DateTimeFormat("de-AT", { day: "numeric", month: "long", timeZone: "Europe/Vienna" });
const tagText = (tag: string) => DATUM.format(new Date(`${tag}T12:00:00Z`));

const SCHRITTE = [
  { id: "auftrag", titel: "Auftrag erhalten", text: "Danke für Ihr Vertrauen!" },
  { id: "inhalte", titel: "Inhalte sammeln", text: "Wir brauchen Ihre Fotos, Texte und Ihr Logo." },
  { id: "umsetzung", titel: "Ihre Website entsteht", text: "Wir bauen und gestalten Ihre Seite." },
  { id: "freigabe", titel: "Ihre Freigabe", text: "Sie sehen sich alles an und sagen uns, ob es passt." },
  { id: "online", titel: "Online", text: "Ihre Website ist für alle erreichbar." },
] as const;

const REIHE = ["inhalte", "umsetzung", "freigabe", "online"];

export default async function KundenProjekt({ params }: PageProps<"/p/[code]">) {
  const { code: roh } = await params;
  const code = decodeURIComponent(roh).toLowerCase().replace(/[^0-9a-f]/g, "").slice(0, 32);
  const supabase = await createClient();
  const { data } = code.length === 32 ? await supabase.rpc("kunden_projekt", { p_code: code }) : { data: null };
  const p = data as Projekt | null;

  if (!p) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16">
        <h1 className="font-serif text-3xl font-semibold text-ink">Dieser Link ist nicht (mehr) gültig.</h1>
        <p className="mt-4 text-lg text-muted">Bitte prüfen Sie, ob Sie den ganzen Link kopiert haben – oder fragen Sie Ihre Ansprechperson nach einem neuen Link.</p>
        <Link href="/" className={buttonClass("secondary", "mt-6")}>
          Zur Startseite
        </Link>
      </div>
    );
  }

  const aktuell = REIHE.indexOf(p.phase) + 1; // Index in SCHRITTE
  const datumVon = (i: number) => {
    const id = SCHRITTE[i].id;
    if (id === "auftrag" || id === "inhalte") return p.seit;
    return p.erreicht[id as "umsetzung" | "freigabe" | "online"] ?? null;
  };
  const online = p.phase === "online";
  const paketName = istPaket(p.paket) ? PAKET_NAMEN[p.paket] : p.paket;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">Ihr Projekt · Paket {paketName}</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
        {online ? `${p.firma} ist online! 🎉` : `Ihre Website für ${p.firma}`}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        Hier sehen Sie jederzeit, wie weit wir sind.
        {p.betreuer ? (
          <>
            {" "}
            Ihre Ansprechperson: <strong className="text-ink">{p.betreuer}</strong>.
          </>
        ) : null}
      </p>

      {/* I2: Fortschritt */}
      <Karte className="mt-8 p-5 sm:p-7">
        <ol className="relative space-y-6">
          {SCHRITTE.map((s, i) => {
            const fertig = i < aktuell || (online && i === aktuell);
            const jetzt = i === aktuell && !online;
            const am = fertig || jetzt ? datumVon(i) : null;
            return (
              <li key={s.id} className="relative flex gap-4">
                {i < SCHRITTE.length - 1 ? (
                  <span aria-hidden className={`absolute left-[19px] top-10 h-[calc(100%-1rem)] w-0.5 ${i < aktuell ? "bg-ok" : "bg-line"}`} />
                ) : null}
                <span
                  aria-hidden
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    fertig ? "bg-ok text-white" : jetzt ? "bg-brand text-white ring-4 ring-brand-light" : "border-2 border-line bg-surface text-muted"
                  }`}
                >
                  {fertig ? "✓" : i + 1}
                </span>
                <div className="min-w-0 pt-1.5">
                  <p className={`font-bold ${fertig || jetzt ? "text-ink" : "text-muted"}`}>
                    {s.titel}
                    {jetzt ? <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">Jetzt</span> : null}
                  </p>
                  <p className="text-sm text-muted">
                    <span className="sr-only">{fertig ? "Erledigt. " : jetzt ? "Aktueller Schritt. " : "Noch offen. "}</span>
                    {s.text}
                  </p>
                  {am ? <p className="mt-0.5 text-sm font-semibold text-ok">{fertig ? "erledigt" : "seit"} {DATUM.format(new Date(am))}</p> : null}
                  {jetzt && p.faellig ? <p className="mt-0.5 text-sm font-semibold text-brand">geplant bis {tagText(p.faellig)}</p> : null}
                </div>
              </li>
            );
          })}
        </ol>
      </Karte>

      {p.website_url ? (
        <Karte className="mt-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="font-bold text-ink">{online ? "Ihre Website" : "Ihre Demo ist bereit"}</p>
            <p className="text-sm text-muted">{p.website_url.replace(/^https?:\/\//, "")}</p>
          </div>
          <a href={p.website_url} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "sm:px-7")}>
            {online ? "Website öffnen" : "Demo ansehen"} →
          </a>
        </Karte>
      ) : null}

      {/* I1: Rückmeldung */}
      {!online ? (
        <Karte className="mt-6 p-5 sm:p-7">
          <h2 className="font-serif text-2xl font-semibold text-ink">{p.website_url ? "Wie gefällt Ihnen die Seite?" : "Haben Sie Wünsche für Ihre Seite?"}</h2>
          <p className="mb-5 mt-1 text-muted">Ihre Antwort geht direkt an {p.betreuer ?? "Ihre Ansprechperson"}.</p>
          <KundenRueckmeldung code={code} />
        </Karte>
      ) : null}

      {p.rueckmeldungen.length > 0 ? (
        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Ihre Rückmeldungen</h2>
          <ul className="mt-2 space-y-2">
            {p.rueckmeldungen.map((r) => (
              <li key={r.am} className="rounded-xl border border-line bg-surface px-4 py-3 text-sm">
                <span className="font-semibold text-ink">{r.art === "passt" ? "👍 Ja, so nehmen" : "✏️ Bitte ändern"}</span>
                <span className="text-muted"> · {DATUM.format(new Date(r.am))}</span>
                {r.text ? <p className="mt-1 text-ink">{r.text}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-10 text-sm text-muted">Dieser Link ist nur für Sie. Bitte geben Sie ihn nicht weiter.</p>
    </div>
  );
}
