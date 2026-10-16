import QRCode from "qrcode";

/** QR-Code als Grafik (SVG), serverseitig erzeugt – der Kunde scannt ihn mit der Handy-Kamera. */
export async function QrCode({ wert, groesse = 200, beschriftung }: { wert: string; groesse?: number; beschriftung: string }) {
  const svg = await QRCode.toString(wert, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#111827", light: "#ffffff" } });
  return (
    <div
      role="img"
      aria-label={beschriftung}
      className="inline-block rounded-xl border border-line bg-white p-2 [&>svg]:h-full [&>svg]:w-full"
      style={{ width: groesse, height: groesse }}
      // Vom Paket „qrcode“ erzeugt, enthält nur Linien und Flächen
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
