import React, { useState } from "react";
import ticketService from "../../services/ticketService";
import bookingService from "../../services/bookingService";
import {
  FileText,
  Download,
  RefreshCw,
  X,
  Ticket,
  Calendar,
  BarChart2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

/**
 * Manager Reports page.
 * Generates real CSV reports from live ticket & booking data.
 */

// ─── helpers ────────────────────────────────────────────────────────────────

const buildCsv = (headers, rows) => {
  const escape = (v) =>
    typeof v === "string" && (v.includes(",") || v.includes('"'))
      ? `"${v.replace(/"/g, '""')}"`
      : v ?? "";
  return [headers.join(","), ...rows.map((r) => r.map(escape).join(","))].join(
    "\n"
  );
};

const downloadCsv = (content, filename) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const today = () => new Date().toISOString().slice(0, 10);

// ─── report definitions ──────────────────────────────────────────────────────

const REPORT_TYPES = [
  {
    id: "ticket_summary",
    label: "Ticket Resolution Report",
    description: "All campus incident & maintenance tickets with status, priority, and assignee.",
    icon: Ticket,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
  {
    id: "booking_summary",
    label: "Booking Activity Report",
    description: "All resource bookings with requester, resource, dates, and status.",
    icon: Calendar,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    id: "ticket_analytics",
    label: "Ticket Analytics Report",
    description: "Aggregated counts by status, priority, and category for KPI tracking.",
    icon: BarChart2,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
];

// ─── generators ──────────────────────────────────────────────────────────────

const generators = {
  ticket_summary: async () => {
    const { data } = await ticketService.getAll("", "", "", "", 0, 1000);
    const tickets = data.content || [];
    const headers = [
      "ID", "Description", "Reporter", "Email", "Location",
      "Category", "Priority", "Status", "Assigned To", "Created At", "Updated At",
    ];
    const rows = tickets.map((t) => [
      t.id,
      t.description,
      t.createdByName || "",
      t.createdByEmail || "",
      t.location,
      t.category,
      t.priority,
      t.status,
      t.assignedTechnicianName || "Unassigned",
      new Date(t.createdAt).toLocaleString(),
      new Date(t.updatedAt).toLocaleString(),
    ]);
    return { csv: buildCsv(headers, rows), count: tickets.length, filename: `ticket_report_${today()}.csv` };
  },

  booking_summary: async () => {
    const bookings = await bookingService.getAllBookings();
    const list = Array.isArray(bookings) ? bookings : bookings.content || [];
    const headers = [
      "ID", "Resource", "Booked By", "Start Time", "End Time", "Purpose", "Status",
    ];
    const rows = list.map((b) => [
      b.id,
      b.resourceName || b.resourceId || "",
      b.userName || b.userEmail || "",
      b.startTime ? new Date(b.startTime).toLocaleString() : "",
      b.endTime ? new Date(b.endTime).toLocaleString() : "",
      b.purpose || "",
      b.status || "",
    ]);
    return { csv: buildCsv(headers, rows), count: list.length, filename: `booking_report_${today()}.csv` };
  },

  ticket_analytics: async () => {
    const { data } = await ticketService.getAll("", "", "", "", 0, 1000);
    const tickets = data.content || [];

    const count = (arr, key, val) => arr.filter((t) => t[key] === val).length;

    const statusRows = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"].map((s) => [
      "Status", s, count(tickets, "status", s),
    ]);
    const priorityRows = ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => [
      "Priority", p, count(tickets, "priority", p),
    ]);
    const categoryRows = ["ELECTRICAL", "PLUMBING", "EQUIPMENT", "STRUCTURAL", "OTHER"].map((c) => [
      "Category", c, count(tickets, "category", c),
    ]);

    const headers = ["Dimension", "Value", "Count"];
    const rows = [...statusRows, ...priorityRows, ...categoryRows];
    return { csv: buildCsv(headers, rows), count: tickets.length, filename: `ticket_analytics_${today()}.csv` };
  },
};

// ─── component ───────────────────────────────────────────────────────────────

const Reports = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState(null);

  // History of generated reports (session-only)
  const [history, setHistory] = useState([]);

  const openModal = () => {
    setSelectedType(null);
    setGenError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (isGenerating) return; // don't close while generating
    setShowModal(false);
    setGenError(null);
    setSelectedType(null);
  };

  const handleGenerate = async () => {
    if (!selectedType) return;
    setIsGenerating(true);
    setGenError(null);

    try {
      const { csv, count, filename } = await generators[selectedType.id]();
      downloadCsv(csv, filename);

      setHistory((prev) => [
        {
          id: Date.now(),
          label: selectedType.label,
          filename,
          count,
          generatedAt: new Date().toLocaleString(),
          type: selectedType.id,
          csv,
        },
        ...prev,
      ]);

      setShowModal(false);
    } catch (err) {
      console.error("Report generation failed", err);
      setGenError("Failed to fetch data. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const reDownload = (entry) => downloadCsv(entry.csv, entry.filename);

  const typeConfig = (id) => REPORT_TYPES.find((r) => r.id === id);

  return (
    <div className="p-2 sm:p-6 max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Reports</h1>
          <p className="text-slate-500 mt-1 font-medium">
            Generate and download real-time operational reports.
          </p>
        </div>
        <button
          id="generate-report-btn"
          onClick={openModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-200 whitespace-nowrap"
        >
          <FileText size={16} />
          Generate New Report
        </button>
      </div>

      {/* ── Available Report Types (info cards) ── */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
          Available Report Types
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REPORT_TYPES.map((rt) => (
            <div
              key={rt.id}
              className={`bg-white p-6 rounded-2xl border ${rt.border} shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => { setSelectedType(rt); setShowModal(true); setGenError(null); }}
            >
              <div className={`w-10 h-10 rounded-xl ${rt.bg} flex items-center justify-center`}>
                <rt.icon size={20} className={rt.color} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{rt.label}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rt.description}</p>
              </div>
              <span className={`self-start text-xs font-bold ${rt.color} mt-auto`}>
                Generate →
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Generated History ── */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
          Generated This Session
        </h2>
        {history.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-12 flex flex-col items-center text-center px-4">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
              <FileText size={20} className="text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm font-medium">No reports generated yet.</p>
            <p className="text-slate-400 text-xs mt-1">Click "Generate New Report" to create your first report.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => {
              const cfg = typeConfig(entry.type);
              return (
                <div
                  key={entry.id}
                  className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${cfg?.bg || "bg-slate-50"} flex items-center justify-center shrink-0`}>
                      {cfg ? <cfg.icon size={18} className={cfg.color} /> : <FileText size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{entry.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {entry.count} records · Generated {entry.generatedAt}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => reDownload(entry)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                  >
                    <Download size={14} />
                    Re-download CSV
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────── Modal ─────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 pt-8 pb-4">
              <h2 className="text-xl font-black text-slate-900">Generate Report</h2>
              <button
                onClick={closeModal}
                disabled={isGenerating}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors disabled:opacity-40"
              >
                <X size={16} className="text-slate-600" />
              </button>
            </div>

            {/* Report Type Selector */}
            <div className="px-8 pb-4 space-y-3">
              <p className="text-sm text-slate-500 font-medium mb-4">Select the type of report to generate:</p>
              {REPORT_TYPES.map((rt) => (
                <button
                  key={rt.id}
                  id={`report-type-${rt.id}`}
                  onClick={() => setSelectedType(rt)}
                  disabled={isGenerating}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    selectedType?.id === rt.id
                      ? `${rt.border} ${rt.bg}`
                      : "border-slate-100 hover:border-slate-200 bg-white"
                  } disabled:opacity-50`}
                >
                  <div className={`w-10 h-10 rounded-xl ${rt.bg} flex items-center justify-center shrink-0`}>
                    <rt.icon size={18} className={rt.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm">{rt.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{rt.description}</p>
                  </div>
                  {selectedType?.id === rt.id && (
                    <CheckCircle2 size={18} className={`${rt.color} shrink-0`} />
                  )}
                </button>
              ))}
            </div>

            {/* Error */}
            {genError && (
              <div className="mx-8 mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-sm font-medium">
                <AlertCircle size={16} />
                {genError}
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex gap-3 px-8 pb-8 pt-2">
              <button
                onClick={closeModal}
                disabled={isGenerating}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                id="confirm-generate-btn"
                onClick={handleGenerate}
                disabled={!selectedType || isGenerating}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-slate-400 disabled:shadow-none"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    Generate &amp; Download
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
