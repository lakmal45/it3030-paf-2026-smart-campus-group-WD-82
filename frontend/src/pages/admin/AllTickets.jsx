import React, { useState, useEffect, useCallback } from "react";
import TicketList from "../../components/tickets/TicketList";
import ticketService from "../../services/ticketService";
import {
  Download, FileSpreadsheet, RefreshCw,
  Ticket, Clock, CheckCircle, AlertCircle,
} from "lucide-react";

// ─── Skeleton shimmer (matches AdminDashboard style) ──────────────────────────
const StatSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div className="space-y-3 w-full">
      <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
      <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
      <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
    </div>
    <div className="w-12 h-12 bg-slate-100 rounded-xl flex-shrink-0 ml-4 animate-pulse" />
  </div>
);

// ─── Stat card (matches AdminDashboard StatCard) ──────────────────────────────
const StatCard = ({ title, value, subtitle, icon: Icon, iconBg, iconColor, valueColor }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow animate-card-enter">
    <div>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
      <p className={`mt-2 text-3xl font-bold ${valueColor || "text-slate-800"}`}>{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
    <div className={`p-3 ${iconBg} rounded-xl ${iconColor}`}>
      <Icon size={24} />
    </div>
  </div>
);

/**
 * Admin view of all tickets — redesigned to match AdminDashboard's
 * premium design language with live stat cards and CSV export.
 */
const AllTickets = () => {
  const [stats, setStats]           = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isExporting, setIsExporting]   = useState(false);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await ticketService.getAll("", "", "", "", 0, 1000);
      const all = data.content || [];
      setStats({
        total:      data.totalElements ?? all.length,
        open:       all.filter((t) => t.status === "OPEN").length,
        inProgress: all.filter((t) => t.status === "IN_PROGRESS").length,
        resolved:   all.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length,
      });
    } catch (err) {
      console.error("Failed to load ticket stats", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const { data } = await ticketService.getAll("", "", "", "", 0, 1000);
      const tickets  = data.content || [];

      if (tickets.length === 0) { alert("No tickets to export."); return; }

      const headers = ["ID", "Reporter", "Email", "Location", "Category", "Priority", "Status", "Assigned To", "Created At", "Description"];
      const rows    = tickets.map((t) => [
        t.id,
        t.createdByName  || "",
        t.createdByEmail || "",
        `"${(t.location    || "").replace(/"/g, '""')}"`,
        t.category,
        t.priority,
        t.status,
        t.assignedTechnicianName || "Unassigned",
        new Date(t.createdAt).toLocaleString(),
        `"${(t.description || "").replace(/"/g, '""')}"`,
      ]);

      const csv  = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `campus_tickets_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export data.");
    } finally {
      setIsExporting(false);
    }
  };

  const statCards = [
    {
      title: "Total Tickets",
      value: stats?.total ?? 0,
      subtitle: "All time",
      icon: Ticket,
      iconBg: "bg-indigo-100", iconColor: "text-indigo-600",
    },
    {
      title: "Open Tickets",
      value: stats?.open ?? 0,
      subtitle: "Requiring attention",
      icon: AlertCircle,
      iconBg: "bg-amber-100", iconColor: "text-amber-600", valueColor: "text-amber-600",
    },
    {
      title: "In Progress",
      value: stats?.inProgress ?? 0,
      subtitle: "Being worked on",
      icon: Clock,
      iconBg: "bg-blue-100", iconColor: "text-blue-600", valueColor: "text-blue-600",
    },
    {
      title: "Resolved / Closed",
      value: stats?.resolved ?? 0,
      subtitle: "Completed tickets",
      icon: CheckCircle,
      iconBg: "bg-emerald-100", iconColor: "text-emerald-600", valueColor: "text-emerald-600",
    },
  ];

  return (
    <div className="animate-fade-in-up space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fleet Management</h1>
          <p className="text-slate-500 mt-1 font-medium">
            Global overview of all campus maintenance incidents.
          </p>
        </div>

        <button
          id="admin-export-csv-btn"
          onClick={handleExportCSV}
          disabled={isExporting}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-200 disabled:opacity-50 whitespace-nowrap"
        >
          {isExporting
            ? <RefreshCw className="animate-spin" size={16} />
            : <FileSpreadsheet size={16} />}
          {isExporting ? "Generating…" : "Export to CSV"}
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading
          ? <><StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton /></>
          : statCards.map((card) => <StatCard key={card.title} {...card} />)
        }
      </div>

      {/* ── Ticket List — premium card matching dashboard ── */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative border-t-4 border-t-indigo-600">

        {/* Card inner header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">All Campus Tickets</h2>
            <p className="text-slate-500 text-sm mt-0.5">Search, filter, and manage every ticket in the system.</p>
          </div>
          <button
            onClick={loadStats}
            disabled={statsLoading}
            id="admin-tickets-refresh-btn"
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all disabled:opacity-40"
          >
            <RefreshCw size={14} className={statsLoading ? "animate-spin" : ""} />
            Refresh Stats
          </button>
        </div>

        <div className="p-6 sm:p-8 pt-4">
          <TicketList
            fetchTickets={ticketService.getAll}
            title=""
            showCreateButton={false}
            emptyMessage="No tickets have been reported yet."
          />
        </div>
      </div>
    </div>
  );
};

export default AllTickets;
