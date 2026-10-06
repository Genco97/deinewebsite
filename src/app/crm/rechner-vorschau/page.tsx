import { ProvisionsRechner } from "@/components/crm/ProvisionsRechner";

// NUR für die Screenshots – wird nicht übernommen
export default async function Vorschau({ searchParams }: PageProps<"/crm/rechner-vorschau">) {
  const { v } = await searchParams;
  const variante = v === "r2" || v === "r3" ? v : "r1";
  return <ProvisionsRechner gruender={false} variante={variante} />;
}
