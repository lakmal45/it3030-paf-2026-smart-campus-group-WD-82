import React from "react";

/**
 * Renders a coloured pill badge representing a ticket status.
 *
 * Colour scheme:
 *  OPEN        → slate/gray
 *  IN_PROGRESS → amber/orange
 *  RESOLVED    → blue
 *  CLOSED      → emerald/green
 *  REJECTED    → rose/red
 */
const STATUS_STYLES = {
  OPEN: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
    label: "Open",
  },
  IN_PROGRESS: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
    label: "In Progress",
  },
  RESOLVED: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
    label: "Resolved",
  },
  CLOSED: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Closed",
  },
  REJECTED: {
    bg: "bg-rose-100",
    text: "text-rose-700",
    dot: "bg-rose-500",
    label: "Rejected",
  },
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.OPEN;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
};

export default StatusBadge;
