"use client";

import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import { besucheEinplanen } from "@/app/crm/besuche/actions";
import { buttonClass, inputClass } from "@/components/ui";
import { mapsRoute } from "@/lib/besuche";
import { LEAD_STATUS, STATUS_LABEL, STATUS_PIN, type LeadStatus } from "@/lib/status";
import { heuteWien } from "@/lib/zeit";

export type KartenLead = {
  id: string;
  firma: string;
  branche: string | null;
  adresse: string | null;
  bezirk: string | null;
  status: LeadStatus;
  lat: number;
  lng: number;
  besuch_geplant: string | null;
  einwilligung_wie: string | null;
};

const WIEN: [number, number] = [48.2082, 16.3738];
const STANDARD_AN: LeadStatus[] = ["neu", "nicht_erreicht", "rueckruf", "interessiert", "demo", "angebot"];

export function KarteAnsicht({ leads }: { leads: KartenLead[] }) {
  const box = useRef<HTMLDivElement>(null);
  const karte = useRef<LeafletMap | null>(null);
  const ebene = useRef<LayerGroup | null>(null);
  const [bereit, setBereit] = useState(false);
  const [filter, setFilter] = useState<LeadStatus[]>(STANDARD_AN);
  const [auswahl, setAuswahl] = useState<string[]>([]);
  const [tag, setTag] = useState(heuteWien());
  const [standortFehler, setStandortFehler] = useState<string | null>(null);

  const sichtbar = useMemo(() => leads.filter((l) => filter.includes(l.status)), [leads, filter]);
  const anzahl = useMemo(() => {
    const z = {} as Record<LeadStatus, number>;
    for (const l of leads) z[l.status] = (z[l.status] ?? 0) + 1;
    return z;
  }, [leads]);
  const gewaehlt = auswahl.map((id) => leads.find((l) => l.id === id)).filter((l): l is KartenLead => !!l);

  // Karte einmal aufbauen (Leaflet braucht das Browserfenster)
  useEffect(() => {
    let abbruch = false;
    (async () => {
      const L = await import("leaflet");
      if (abbruch || !box.current || karte.current) return;
      const m = L.map(box.current, { zoomControl: true, attributionControl: true }).setView(WIEN, 12);
      L.tileLayer("https://mapsneu.wien.gv.at/basemap/bmapgrau/normal/google3857/{z}/{y}/{x}.png", {
        maxZoom: 19,
        attribution: 'Grundkarte: <a href="https://basemap.at" target="_blank" rel="noopener">basemap.at</a>',
      }).addTo(m);
      ebene.current = L.layerGroup().addTo(m);
      karte.current = m;
      setBereit(true);
    })();
    return () => {
      abbruch = true;
      karte.current?.remove();
      karte.current = null;
    };
  }, []);

  // Pins zeichnen
  useEffect(() => {
    if (!bereit || !karte.current || !ebene.current) return;
    let abbruch = false;
    (async () => {
      const L = await import("leaflet");
      if (abbruch || !ebene.current) return;
      ebene.current.clearLayers();
      for (const l of sichtbar) {
        const drin = auswahl.includes(l.id);
        const pin = L.circleMarker([l.lat, l.lng], {
          radius: drin ? 11 : 8,
          color: drin ? "#111827" : "#ffffff",
          weight: drin ? 3 : 2,
          fillColor: STATUS_PIN[l.status],
          fillOpacity: 0.95,
        });
        pin.bindPopup(() => popup(l, drin, () => umschalten(l.id)), { closeButton: true, minWidth: 220 });
        pin.bindTooltip(l.firma, { direction: "top", offset: [0, -8] });
        ebene.current.addLayer(pin);
      }
    })();
    return () => {
      abbruch = true;
    };
  }, [bereit, sichtbar, auswahl]);

  // Beim ersten Laden auf alle Pins zoomen
  const gezoomt = useRef(false);
  useEffect(() => {
    if (!bereit || gezoomt.current || !karte.current || sichtbar.length === 0) return;
    gezoomt.current = true;
    (async () => {
      const L = await import("leaflet");
      const grenzen = L.latLngBounds(sichtbar.map((l) => [l.lat, l.lng] as [number, number]));
      karte.current?.fitBounds(grenzen, { padding: [30, 30], maxZoom: 16 });
    })();
  }, [bereit, sichtbar]);

  function umschalten(id: string) {
    setAuswahl((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
    karte.current?.closePopup();
  }

  function standort() {
    setStandortFehler(null);
    if (!navigator.geolocation) return setStandortFehler("Dein Gerät kann den Standort nicht bestimmen.");
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const L = await import("leaflet");
        const pos: [number, number] = [p.coords.latitude, p.coords.longitude];
        karte.current?.setView(pos, 16);
        if (ebene.current) L.circleMarker(pos, { radius: 7, color: "#fff", weight: 3, fillColor: "#111827", fillOpacity: 1 }).addTo(ebene.current);
      },
      () => setStandortFehler("Standort nicht verfügbar. Bitte erlaube den Zugriff im Browser."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const route = mapsRoute(gewaehlt);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Status anzeigen">
        {LEAD_STATUS.filter((s) => anzahl[s]).map((s) => {
          const an = filter.includes(s);
          return (
            <button
              key={s}
              type="button"
              aria-pressed={an}
              onClick={() => setFilter((f) => (an ? f.filter((x) => x !== s) : [...f, s]))}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm font-semibold ${
                an ? "border-ink/20 bg-surface text-ink" : "border-line bg-bg text-muted line-through"
              }`}
            >
              <span aria-hidden className="h-3 w-3 rounded-full border border-white shadow" style={{ background: STATUS_PIN[s] }} />
              {STATUS_LABEL[s]} <span className="text-muted">{anzahl[s]}</span>
            </button>
          );
        })}
      </div>

      {/* isolate: Leaflet-Ebenen (z-index 400–1000) bleiben in der Karte und liegen nicht über dem Handy-Menü */}
      <div className="relative isolate overflow-hidden rounded-xl border border-line">
        <div ref={box} className="h-[60vh] min-h-80 w-full bg-bg" />
        <button
          type="button"
          onClick={standort}
          className="absolute bottom-6 right-3 z-[1000] min-h-11 rounded-lg border border-line bg-surface px-3 text-sm font-semibold text-ink shadow"
        >
          ◎ Mein Standort
        </button>
      </div>
      {standortFehler ? <p className="text-sm text-danger">{standortFehler}</p> : null}

      <div className="rounded-xl border border-line bg-surface p-4">
        <h2 className="font-bold text-ink">Runde zusammenstellen</h2>
        {gewaehlt.length === 0 ? (
          <p className="mt-1 text-sm text-muted">Tippe auf Pins und dann auf „Zur Runde“, um eine Besuchsrunde zu planen.</p>
        ) : (
          <>
            <ol className="mt-3 space-y-1 text-sm">
              {gewaehlt.map((l, i) => (
                <li key={l.id} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate">
                    <span className="font-semibold text-muted">{i + 1}.</span>{" "}
                    <Link href={`/crm/leads/${l.id}`} className="font-semibold text-ink hover:text-brand">
                      {l.firma}
                    </Link>{" "}
                    <span className="text-muted">{l.adresse}</span>
                  </span>
                  <button type="button" onClick={() => umschalten(l.id)} className="min-h-11 shrink-0 px-2 text-muted hover:text-danger" aria-label={`${l.firma} entfernen`}>
                    ✕
                  </button>
                </li>
              ))}
            </ol>
            <form action={besucheEinplanen} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
              {auswahl.map((id) => (
                <input key={id} type="hidden" name="ids" value={id} />
              ))}
              <input type="hidden" name="zurueck" value={`/crm/besuche?tag=${tag}`} />
              <label className="text-sm font-semibold text-ink">
                Besuchen am
                <input name="tag" type="date" min={heuteWien()} value={tag} onChange={(e) => setTag(e.target.value)} required className={`${inputClass} mt-1`} />
              </label>
              <button className={buttonClass("primary")}>{gewaehlt.length} {gewaehlt.length === 1 ? "Besuch" : "Besuche"} einplanen</button>
              {route ? (
                <a href={route} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary")}>
                  Route in Google Maps{gewaehlt.length > 10 ? " (erste 10)" : ""}
                </a>
              ) : null}
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/** Popup-Inhalt als DOM – Texte nur über textContent (keine HTML-Einschleusung) */
function popup(l: KartenLead, drin: boolean, umschalten: () => void) {
  const el = document.createElement("div");
  el.className = "space-y-1 text-sm";
  const titel = document.createElement("a");
  titel.href = `/crm/leads/${l.id}`;
  titel.textContent = l.firma;
  titel.className = "block text-base font-bold text-ink hover:underline";
  const info = document.createElement("p");
  info.textContent = [STATUS_LABEL[l.status], l.branche].filter(Boolean).join(" · ");
  info.style.color = STATUS_PIN[l.status] === "#d6d3d1" ? "#57534e" : STATUS_PIN[l.status];
  info.className = "font-semibold";
  const ort = document.createElement("p");
  ort.textContent = [l.adresse, l.bezirk].filter(Boolean).join(", ");
  ort.className = "text-muted";
  el.append(titel, info, ort);
  if (l.besuch_geplant) {
    const g = document.createElement("p");
    g.textContent = `Besuch geplant: ${new Date(`${l.besuch_geplant}T12:00:00Z`).toLocaleDateString("de-AT")}`;
    el.append(g);
  }
  if (!l.einwilligung_wie && l.status !== "nicht_anrufen") {
    const w = document.createElement("p");
    w.textContent = "Kein Anruf – nur Besuch oder Brief";
    w.className = "text-amber-800";
    el.append(w);
  }
  const knopf = document.createElement("button");
  knopf.type = "button";
  knopf.textContent = drin ? "Aus der Runde nehmen" : "Zur Runde";
  knopf.className = "mt-2 min-h-11 w-full rounded-lg bg-brand px-3 font-semibold text-white";
  knopf.onclick = umschalten;
  el.append(knopf);
  return el;
}
