import { STATUS_FARBE, STATUS_LABEL, type LeadStatus } from "@/lib/status";

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_FARBE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
