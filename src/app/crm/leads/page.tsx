import type { Metadata } from "next";
import Link from "next/link";
import { CsvImport } from "@/components/crm/CsvImport";
import { LeadAnlegen } from "@/components/crm/LeadAnlegen";
import { NotizSchnell } from "@/components/crm/NotizSchnell";
import { StatusSchnell } from "@/components/crm/StatusSchnell";
import { WhatsAppKnopf } from "@/components/crm/WhatsApp";
import { ZuteilenLeiste } from "@/components/crm/ZuteilenLeiste";
import { Hinweis, Karte, Select, buttonClass, inputClass } from "@/components/ui";
import { EINWILLIGUNG_ARTEN } from "@/lib/einwilligung";
import { einwilligungSetzen } from "./actions";
import { aktivePersonen, holeProfil } from "@/lib/crm";
import { ABGESCHLOSSEN, OFFEN_STATUS, istAnsicht, naechsteAktion, type Ansicht } from "@/lib/leadansicht";
import { liegtSeit, schrittVorgabe } from "@/lib/schritt";
import { LEAD_STATUS, STATUS_LABEL, istLeadStatus, type LeadStatus } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";
import { datum, datumZeit, heuteWien, wienGrenzen } from "@/lib/zeit";

export const metadata: Metadata = { title: "Leads" };

const LIMIT = 200;

const QUELLE_KURZ: Record<string, string> = {
  manuell: "Manuell",
  csv: "CSV",
  leadfinder: "Lead Finder",
  recherche: "Recherche",
};
const quelleKurz = (q: string) => (q.startsWith("anfrage:") ? "Website" : (QUELLE_KURZ[q] ?? q));

export default async function Leads({ searchParams }: PageProps<"/crm/leads">) {
  const profil = await holeProfil();
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 100);
  const status = typeof sp.status === "string" && istLeadStatus(sp.status) ? sp.status : "";
  const admin = profil.rolle === "admin";
  const personen = admin ? await aktivePersonen() : [];
  const gruender = personen.filter((p) => p.rolle === "admin").map((p) => p.id);
  // Filter „Zugeteilt an“ (nur Gründer): Person-ID oder „offen“ = liegt noch bei Gründern
  const besitzer =
    admin && typeof sp.besitzer === "string" && (sp.besitzer === "offen" || personen.some((p) => p.id === sp.besitzer))
      ? sp.besitzer
      : "";
  const branche = (typeof sp.branche === "string" ? sp.branche : "").trim().slice(0, 100);
  const ok = typeof sp.ok === "string" ? sp.ok : null;
  const fehler = typeof sp.fehler === "string" ? sp.fehler : null;
  const filter = new URLSearchParams({
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
    ...(branche ? { branche } : {}),
    ...(besitzer ? { besitzer } : {}),
  });
  const heute = heuteWien();
  const jetztIso = new Date().toISOString();
  const jetzt = Date.parse(jetztIso);
  const { tagEnde } = wienGrenzen();

  const supabase = await createClient();

  // Zahlen für die Ansichten: immer „meine“ Leads (bei Gründern nicht das ganze Team)
  const abgeschlossen = `(${ABGESCHLOSSEN.join(",")})`;
  const meine = () => supabase.from("leads").select("id", { count: "exact", head: true }).eq("besitzer_id", profil.id);
  const [zHeute, zRueck, zAnrufen, zBesuch, zNeu, zAlle] = await Promise.all([
    meine().not("status", "in", abgeschlossen).or(`naechster_rueckruf.lt.${tagEnde},besuch_geplant.lte.${heute}`),
    meine().not("status", "in", abgeschlossen).not("naechster_rueckruf", "is", null).lt("naechster_rueckruf", tagEnde),
    meine().in("status", OFFEN_STATUS).not("einwilligung_wie", "is", null).not("telefon", "is", null),
    meine().in("status", OFFEN_STATUS).is("einwilligung_wie", null),
    meine().eq("status", "neu"),
    supabase.from("leads").select("id", { count: "exact", head: true }),
  ]);
  const zahl = { heute: zHeute.count ?? 0, rueckrufe: zRueck.count ?? 0, anrufen: zAnrufen.count ?? 0, besuch: zBesuch.count ?? 0, neu: zNeu.count ?? 0, alle: zAlle.count ?? 0 };

  // Welche Ansicht? Wer sucht oder filtert, sucht in allen Leads; sonst das Wichtigste zuerst
  const gesucht = !!(q || status || branche || besitzer);
  const ansicht: Ansicht = istAnsicht(sp.ansicht)
    ? sp.ansicht
    : gesucht
      ? "alle"
      : zahl.heute > 0
        ? "heute"
        : zahl.anrufen > 0
          ? "anrufen"
          : "alle";
  const mitPerson = admin && ansicht === "alle";
  const hier = filter.size ? `/crm/leads?ansicht=${ansicht}&${filter}` : `/crm/leads?ansicht=${ansicht}`;

  let abfrage = supabase
    .from("leads")
    .select("id, firma, ansprechpartner, branche, telefon, bezirk, quelle, status, status_seit, naechster_rueckruf, besuch_geplant, einwilligung_wie, besitzer:profiles!leads_besitzer_id_fkey(name)", {
      count: "exact",
    })
    .limit(LIMIT);

  if (ansicht !== "alle") abfrage = abfrage.eq("besitzer_id", profil.id);
  if (ansicht === "heute") abfrage = abfrage.not("status", "in", abgeschlossen).or(`naechster_rueckruf.lt.${tagEnde},besuch_geplant.lte.${heute}`);
  if (ansicht === "rueckrufe") abfrage = abfrage.not("status", "in", abgeschlossen).not("naechster_rueckruf", "is", null).lt("naechster_rueckruf", tagEnde);
  if (ansicht === "anrufen") abfrage = abfrage.in("status", OFFEN_STATUS).not("einwilligung_wie", "is", null).not("telefon", "is", null);
  if (ansicht === "besuch") abfrage = abfrage.in("status", OFFEN_STATUS).is("einwilligung_wie", null);
  if (ansicht === "neu") abfrage = abfrage.eq("status", "neu");
  if (ansicht === "heute" || ansicht === "rueckrufe") {
    abfrage = abfrage.order("naechster_rueckruf", { ascending: true, nullsFirst: false }).order("besuch_geplant", { ascending: true, nullsFirst: false });
  }
  abfrage = abfrage.order("created_at", { ascending: false });

  if (status) abfrage = abfrage.eq("status", status);
  if (branche) abfrage = abfrage.eq("branche", branche);
  if (!mitPerson) {
    // Die Person-Auswahl gibt es nur in „Alle“
  } else if (besitzer === "offen") abfrage = abfrage.in("besitzer_id", gruender.length ? gruender : [profil.id]);
  else if (besitzer) abfrage = abfrage.eq("besitzer_id", besitzer);
  if (q) {
    // Zeichen entfernen, die in PostgREST-Filtern eine Bedeutung haben
    const sicher = q.replace(/[,()%*\\:"]/g, " ").trim();
    if (sicher) {
      const m = `%${sicher}%`;
      // Auch in Notizen suchen (RLS: nur Notizen zu sichtbaren Leads)
      const { data: treffer } = await supabase.from("lead_verlauf").select("lead_id").ilike("text", m).limit(200);
      const ids = [...new Set((treffer ?? []).map((t) => t.lead_id as string))];
      const nummer = sicher.replace(/\D/g, "");
      abfrage = abfrage.or(
        [
          `firma.ilike.${m}`,
          `ansprechpartner.ilike.${m}`,
          `branche.ilike.${m}`,
          `email.ilike.${m}`,
          `telefon.ilike.${m}`,
          // Nummer auch ohne Leerzeichen/Schrägstriche finden: „0664 123“ findet „0664/123…“
          ...(nummer.length >= 4 ? [`telefon.ilike.*${nummer.split("").join("*")}*`] : []),
          `bezirk.ilike.${m}`,
          `adresse.ilike.${m}`,
          ...(ids.length ? [`id.in.(${ids.join(",")})`] : []),
        ].join(","),
      );
    }
  }

  const [{ data, count, error }, { data: brancheZeilen }] = await Promise.all([
    abfrage,
    // Alle vorkommenden Branchen für den Filter
    supabase.from("leads").select("branche").not("branche", "is", null).limit(5000),
  ]);
  const branchen = [...new Set((brancheZeilen ?? []).map((b) => (b.branche as string).trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "de"),
  );
  const leads = (data ?? []) as unknown as {
    id: string;
    firma: string;
    ansprechpartner: string | null;
    branche: string | null;
    telefon: string | null;
    bezirk: string | null;
    status: LeadStatus;
    status_seit: string;
    quelle: string;
    naechster_rueckruf: string | null;
    besuch_geplant: string | null;
    einwilligung_wie: string | null;
    besitzer: { name: string } | null;
  }[];
  // Letzte Notiz je Lead: wie man verblieben ist
  const notizen = new Map<string, { text: string; am: string }[]>();
  if (leads.length) {
    const { data: n } = await supabase
      .from("lead_verlauf")
      .select("lead_id, text, created_at")
      .in("lead_id", leads.map((l) => l.id))
      .eq("art", "notiz")
      .order("created_at", { ascending: false })
      .limit(2000);
    for (const z of n ?? []) {
      const liste = notizen.get(z.lead_id as string) ?? [];
      if (liste.length < 3) liste.push({ text: z.text as string, am: z.created_at as string });
      notizen.set(z.lead_id as string, liste);
    }
  }
  // WhatsApp: Vorlagen und wann zuletzt eine gesendet wurde
  const { data: waRoh } = await supabase.from("vorlagen").select("id, titel, text").eq("kanal", "whatsapp").order("reihenfolge");
  const waVorlagen = (waRoh ?? []) as { id: string; titel: string; text: string }[];
  const waZuletzt = new Map<string, string>();
  const waZustimmung = new Set<string>();
  if (leads.length) {
    const { data: zu } = await supabase
      .from("lead_verlauf")
      .select("lead_id")
      .in("lead_id", leads.map((l) => l.id))
      .eq("art", "system")
      .like("text", "WhatsApp-Zustimmung bestätigt%")
      .limit(1000);
    for (const z of zu ?? []) waZustimmung.add(z.lead_id as string);
    const { data: w } = await supabase
      .from("lead_verlauf")
      .select("lead_id, created_at")
      .in("lead_id", leads.map((l) => l.id))
      .eq("art", "system")
      .like("text", "WhatsApp gesendet%")
      .order("created_at", { ascending: false })
      .limit(1000);
    for (const z of w ?? []) if (!waZuletzt.has(z.lead_id as string)) waZuletzt.set(z.lead_id as string, z.created_at as string);
  }
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const meinName = profil.name.trim() || profil.email;
  const waKnopf = (l: { id: string; firma: string; ansprechpartner: string | null; telefon: string | null; status: string; einwilligung_wie: string | null }) =>
    l.telefon && l.status !== "nicht_anrufen" && l.status !== "falsche_nummer" ? (
      <WhatsAppKnopf
        symbol
        lead={{ id: l.id, firma: l.firma, ansprechpartner: l.ansprechpartner, telefon: l.telefon, erlaubt: !!l.einwilligung_wie || waZustimmung.has(l.id), frage: l.status !== "falsche_nummer" }}
        daten={{ vorlagen: waVorlagen, site, meinName }}
        anlass={l.status === "demo" ? "demo" : l.status === "nicht_erreicht" ? "nicht_erreicht" : "gespraech"}
      />
    ) : null;
  const waHinweis = (id: string) =>
    waZuletzt.has(id) ? <span className="block text-xs font-semibold text-ok">✓ WhatsApp gesendet · {datum(waZuletzt.get(id)!)}</span> : null;
  const notizFeld = (l: { id: string; firma: string }) => {
    const n = notizen.get(l.id) ?? [];
    return <NotizSchnell id={l.id} firma={l.firma} notizen={n.map((z) => ({ text: z.text, am: datum(z.am) }))} />;
  };
  type Zeile = (typeof leads)[number];
  const aktion = (l: Zeile) => {
    const a = naechsteAktion(l, jetztIso, heute);
    if (!a) return <span className="text-muted">–</span>;
    const klasse = `inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-semibold ${
      a.rot ? "bg-danger/10 text-danger" : a.wahl ? "bg-brand text-white" : "bg-brand-light text-brand"
    }`;
    return a.wahl && l.telefon ? (
      <a href={`tel:${l.telefon.replace(/[^\d+]/g, "")}`} className={klasse}>
        {a.label}
      </a>
    ) : (
      <Link href={`/crm/leads/${l.id}`} className={klasse}>
        {a.label}
      </Link>
    );
  };
  const schnell = (l: Zeile) => (
    <StatusSchnell
      id={l.id}
      firma={l.firma}
      status={l.status}
      anrufOk={!!l.einwilligung_wie}
      vorgabe={schrittVorgabe(l)}
      zurueck={hier}
    />
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="min-w-48 flex-1">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Leads</h1>
          <p className="mt-1 text-muted">{admin ? "Alle Leads im Team." : "Deine Leads."}</p>
        </div>
        <LeadAnlegen />
        <CsvImport personen={personen} ichId={profil.id} />
      </div>

      <nav aria-label="Ansicht" className="mb-3 flex flex-wrap items-stretch gap-2">
        <div className="flex overflow-hidden rounded-xl border border-line bg-white text-sm font-semibold">
          <Link
            href="/crm/leads?ansicht=heute"
            className={`flex items-center px-3.5 ${ansicht !== "alle" ? "bg-brand text-white" : "text-ink hover:bg-bg"}`}
          >
            Meine
          </Link>
          <Link
            href="/crm/leads?ansicht=alle"
            className={`flex items-center px-3.5 ${ansicht === "alle" ? "bg-brand text-white" : "text-ink hover:bg-bg"}`}
          >
            Alle ({zahl.alle})
          </Link>
        </div>
        {ansicht !== "alle"
          ? (
              [
                ["heute", "Heute dran"],
                ["rueckrufe", "Rückrufe fällig"],
                ["anrufen", "Zum Anrufen"],
                ["besuch", "Ohne Zustimmung"],
                ["neu", "Neu"],
              ] as const
            ).map(([k, titel]) => (
              <Link
                key={k}
                href={`/crm/leads?ansicht=${k}`}
                aria-current={ansicht === k ? "page" : undefined}
                className={`min-w-28 flex-1 rounded-xl border px-3 py-2 ${ansicht === k ? "border-brand bg-brand-light" : "border-line bg-white hover:bg-bg"}`}
              >
                <span className="block text-xl font-bold leading-none text-ink">{zahl[k]}</span>
                <span className="mt-1 block text-xs text-muted">{titel}</span>
              </Link>
            ))
          : null}
      </nav>

      <form
        key={hier}
        method="get"
        className={`mb-4 grid grid-cols-2 gap-2 ${admin ? "lg:grid-cols-[1fr_160px_170px_180px_auto]" : "sm:grid-cols-[1fr_180px_180px_auto]"}`}
        role="search"
      >
        <input type="hidden" name="ansicht" value={ansicht} />
        <label className="sr-only" htmlFor="q">
          Suche
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Firma, Person, Telefon, Adresse, Notiz …"
          className={`${inputClass} col-span-2 sm:col-span-1`}
        />
        <label className="sr-only" htmlFor="status">
          Status
        </label>
        <Select name="status" defaultValue={status}>
          <option value="">Alle Status</option>
          {LEAD_STATUS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
        <label className="sr-only" htmlFor="filter-branche">
          Branche
        </label>
        <Select id="filter-branche" name="branche" defaultValue={branche}>
          <option value="">Alle Branchen</option>
          {branche && !branchen.includes(branche) ? <option value={branche}>{branche}</option> : null}
          {branchen.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
        {mitPerson ? (
          <>
            <label className="sr-only" htmlFor="filter-besitzer">
              Zugeteilt an
            </label>
            <Select id="filter-besitzer" name="besitzer" defaultValue={besitzer} className="col-span-2 lg:col-span-1">
              <option value="">Alle Personen</option>
              <option value="offen">Noch nicht verteilt</option>
              {personen.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.trim() || p.email}
                </option>
              ))}
            </Select>
          </>
        ) : null}
        <div className={`col-span-2 flex gap-2 ${admin ? "lg:col-span-1" : "sm:col-span-1"}`}>
          <button className={buttonClass("primary", "flex-1")}>Filtern</button>
          {q || status || branche || besitzer ? (
            <Link href={`/crm/leads?ansicht=${ansicht}`} className={buttonClass("secondary")}>
              Zurücksetzen
            </Link>
          ) : null}
        </div>
      </form>

      <p className="mb-2 text-sm text-muted">
        {count ?? 0} {count === 1 ? "Lead" : "Leads"}
        {count && count > LIMIT ? ` – die neuesten ${LIMIT} werden angezeigt. Grenz die Suche ein.` : ""}
      </p>

      {error ? <p className="text-danger">Die Leads konnten nicht geladen werden.</p> : null}

      {ok ? (
        <div className="mb-4">
          <Hinweis art="ok">{ok}</Hinweis>
        </div>
      ) : null}
      {fehler ? (
        <div className="mb-4">
          <Hinweis art="fehler">{fehler}</Hinweis>
        </div>
      ) : null}
      {admin && leads.length > 0 ? <ZuteilenLeiste personen={personen} zurueck={hier} /> : null}

      {leads.length === 0 ? (
        <Karte>
          <p className="px-5 py-10 text-center text-muted">Keine Leads gefunden.</p>
        </Karte>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {leads.map((l) => {
            const nummer = l.telefon?.replace(/[^+0-9]/g, "") ?? "";
            const gesperrt = l.status === "nicht_anrufen" || l.status === "falsche_nummer";
            const anrufbar = !!l.telefon && !!l.einwilligung_wie && !gesperrt;
            const seit = liegtSeit(l.status, l.status_seit, jetzt);
            return (
              <li key={l.id} className="flex flex-col rounded-2xl border border-line bg-surface p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {admin ? (
                      <label className="mr-1 flex items-center">
                        <span className="sr-only">{l.firma} markieren</span>
                        <input type="checkbox" name="ids" value={l.id} form="zuteilen" className="h-5 w-5 accent-brand" />
                      </label>
                    ) : null}
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${l.quelle.startsWith("anfrage:") ? "bg-ok-light text-ok" : "bg-bg text-muted"}`}>
                      {quelleKurz(l.quelle)}
                    </span>
                    {l.branche ? <span className="rounded-full bg-bg px-2.5 py-0.5 text-xs font-semibold text-muted">{l.branche}</span> : null}
                  </div>
                  {admin && l.besitzer ? <span className="shrink-0 text-xs text-muted">Bei: {l.besitzer.name}</span> : null}
                </div>

                <Link href={`/crm/leads/${l.id}`} className="mt-2 block text-lg font-bold leading-snug text-ink hover:text-brand">
                  {l.firma}
                  {l.ansprechpartner ? <span className="font-normal text-muted"> · {l.ansprechpartner}</span> : null}
                </Link>

                {/* Nummer: antippen = anrufen (nur mit eingetragener Zustimmung) */}
                <div className="mt-3 flex items-center gap-2">
                  {gesperrt ? (
                    <span className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-bg px-3 text-sm font-semibold text-muted">
                      {l.status === "falsche_nummer" ? "Falsche Nummer" : "Nicht anrufen"}
                    </span>
                  ) : !l.telefon ? (
                    <span className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-bg px-3 text-sm text-muted">Keine Nummer</span>
                  ) : anrufbar ? (
                    <a
                      href={`tel:${nummer}`}
                      className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-light px-3 text-[17px] font-extrabold text-brand hover:bg-brand hover:text-white"
                    >
                      <span aria-hidden>📞</span> {l.telefon}
                    </a>
                  ) : (
                    <details className="group relative flex-1">
                      <summary className="flex min-h-12 cursor-pointer list-none flex-col items-center justify-center rounded-xl bg-bg px-3 py-1 text-center [&::-webkit-details-marker]:hidden">
                        <span className="font-bold text-muted">🔒 {l.telefon}</span>
                        <span className="text-xs font-semibold text-brand underline">Zustimmung eintragen</span>
                      </summary>
                      <form action={einwilligungSetzen} className="mt-2 space-y-2 rounded-xl border border-line bg-surface p-3">
                        <input type="hidden" name="id" value={l.id} />
                        <p className="text-xs text-muted">Nur eintragen, wenn der Betrieb wirklich zugestimmt hat. Danach ist die Nummer antippbar.</p>
                        <Select name="wie" required defaultValue="" aria-label="Wie hat der Betrieb zugestimmt?">
                          <option value="" disabled>
                            Wie hat er zugestimmt?
                          </option>
                          {EINWILLIGUNG_ARTEN.map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                        </Select>
                        <button className={buttonClass("primary", "w-full")}>Zustimmung speichern</button>
                      </form>
                    </details>
                  )}
                  {waKnopf(l)}
                </div>
                {waHinweis(l.id)}

                <p className="mt-2 text-sm text-muted">📍 {l.bezirk ?? "kein Bezirk"}</p>
                <div className="mt-2 rounded-lg bg-bg px-3 py-2">{notizFeld(l)}</div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {schnell(l)}
                    {aktion(l)}
                  </div>
                  <p className="text-right text-xs text-muted">
                    <span className="block font-semibold uppercase tracking-wide">Bearbeitet</span>
                    {datumZeit(l.status_seit)}
                    {seit ? <span className="block text-danger">liegt seit {seit} Tagen</span> : null}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div aria-hidden className="h-20" />
    </>
  );
}
