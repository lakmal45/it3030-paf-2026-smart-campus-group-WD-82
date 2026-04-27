import React, { useState, useEffect } from "react";
import TicketList from "../../components/tickets/TicketList";
import ticketService from "../../services/ticketService";
import { Download, FileSpreadsheet, RefreshCw, Ticket, AlertCircle, CheckCircle2, Clock } from "lucide-react";

/**
 * Manager view of all tickets in the system.
 * Provides an operational overview with summary stats and CSV export.
 */
const ManagerTickets = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0, total: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await ticketService.getAll("", "", "", "", 0, 1000);
        const tickets = data.content || [];
        setStats({
          total: data.totalElements || tickets.length,
          open: tickets.filter((t) => t.status === "OPEN").length,
          inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
          resolved: tickets.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length,
        });
      } catch (err) {
        console.error("Failed to load ticket stats", err);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const { data } = await ticketService.getAll("", "", "", "", 0, 1000);
      const tickets = data.content || [];

      if (tickets.length === 0) {
        alert("No tickets to export.");
        return;
      }

      const headers = ["ID", "Reporter", "Email", "Location", "Category", "Priority", "Status", "Assigned To", "Created At", "Description"];
      const rows = tickets.map((t) => [
        t.id,
        t.createdByName || "",
        t.createdByEmail || "",
        `"${(t.location || "").replace(/"/g, '""')}"`,
        t.category,
        t.priority,
        t.status,
        t.assignedTechnicianName || "Unassigned",
        new Date(t.createdAt).toLocaleString(),
        `"${(t.description || "").replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `manager_tickets_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export data.");
    } finally {
      setIsExporting(false);
    }
  };

  const statCards = [
    {
      label: "Total Tickets",
      value: stats.total,
      icon: Ticket,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
    },
    {
      label: "Open",
      value: stats.open,
      icon: AlertCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      label: "Resolved / Closed",
      value: stats.resolved,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
  ];

  return (
    <div className="p-2 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ticket Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">
            Operational view of all campus maintenance &amp; incident tickets.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          id="manager-export-csv-btn"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-200 disabled:opacity-50 whitespace-nowrap"
        >
          {isExporting ? (
            <RefreshCw className="animate-spin" size={16} />
          ) : (
            <FileSpreadsheet size={16} />
          )}
          {isExporting ? "Generating..." : "Export CSV"}
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-white p-5 rounded-2xl border ${card.border} shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow`}
          >
            <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
              <card.icon size={20} className={card.color} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
              <p className={`text-2xl font-black mt-0.5 ${statsLoading ? "animate-pulse text-slate-200" : card.color}`}>
                {statsLoading ? "—" : card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
        <TicketList
          fetchTickets={ticketService.getAll}
          title="All Campus Tickets"
          showCreateButton={false}
          emptyMessage="No tickets have been reported yet."
        />
      </div>
    </div>
  );
};

export default ManagerTickets;
