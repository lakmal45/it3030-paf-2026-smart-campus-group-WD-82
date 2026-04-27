import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ticketService from "../../services/ticketService";
import StatusBadge from "../../components/tickets/StatusBadge";
import { RefreshCw, AlertCircle, Wrench, ExternalLink } from "lucide-react";

/**
 * Manager Maintenance page — displays real maintenance/incident tickets
 * fetched from the live backend, filtered to relevant technical categories.
 */
const Maintenance = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const MAINTENANCE_CATEGORIES = ["ELECTRICAL", "PLUMBING", "EQUIPMENT", "STRUCTURAL", "OTHER"];

  const loadTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await ticketService.getAll(
        statusFilter,
        categoryFilter,
        "",
        "",
        0,
        50
      );
      setTickets(data.content || []);
    } catch (err) {
      console.error("Failed to load maintenance tickets", err);
      setError("Failed to load tickets. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, statusFilter]);

  const priorityConfig = {
    CRITICAL: "bg-rose-100 text-rose-700 border-rose-200",
    HIGH: "bg-orange-100 text-orange-700 border-orange-200",
    MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
    LOW: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <div className="p-2 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <Wrench size={20} className="text-indigo-600" />
            </span>
            Maintenance Oversight
          </h1>
          <p className="text-slate-500 mt-1 font-medium ml-1">
            Live view of campus maintenance &amp; incident tickets.
          </p>
        </div>

        <button
          onClick={loadTickets}
          disabled={isLoading}
          id="maintenance-refresh-btn"
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            id="maintenance-category-filter"
            className="pl-4 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none shadow-sm cursor-pointer"
          >
            <option value="">All Categories</option>
            {MAINTENANCE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0) + c.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            id="maintenance-status-filter"
            className="pl-4 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none shadow-sm cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
        </div>

        {(categoryFilter || statusFilter) && (
          <button
            onClick={() => { setCategoryFilter(""); setStatusFilter(""); }}
            className="px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="space-y-px animate-pulse p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-50 rounded-xl w-full" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <Wrench className="text-slate-300" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No Maintenance Tickets</h3>
            <p className="text-slate-500 text-sm max-w-sm">
              {categoryFilter || statusFilter
                ? "No tickets match your current filters."
                : "No maintenance or incident tickets have been submitted yet."}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold hidden sm:table-cell">Description</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold hidden md:table-cell">Category</th>
                <th className="p-4 font-semibold hidden lg:table-cell">Handler</th>
                <th className="p-4 font-semibold hidden lg:table-cell">Priority</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors group"
                >
                  <td className="p-4 text-slate-800 font-black text-sm">#{ticket.id}</td>
                  <td className="p-4 text-slate-700 text-sm font-medium hidden sm:table-cell max-w-xs">
                    <span className="line-clamp-1">{ticket.description}</span>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">{ticket.location}</td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold uppercase">
                      {ticket.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 text-sm hidden lg:table-cell">
                    {ticket.assignedTechnicianName ? (
                      <span className="font-semibold text-indigo-700">{ticket.assignedTechnicianName}</span>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        priorityConfig[ticket.priority] || priorityConfig.LOW
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="p-4">
                    <Link
                      to={`/dashboard/manager/tickets/${ticket.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                    >
                      View <ExternalLink size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary Footer */}
      {!isLoading && tickets.length > 0 && (
        <p className="text-xs text-slate-400 text-center font-medium">
          Showing {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}.{" "}
          <Link to="/dashboard/manager/tickets" className="text-indigo-500 hover:underline font-semibold">
            View all tickets →
          </Link>
        </p>
      )}
    </div>
  );
};

export default Maintenance;
