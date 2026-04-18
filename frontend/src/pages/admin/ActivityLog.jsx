import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import {
  ClipboardList, Search, Filter, Download, RefreshCw,
  Calendar, Users, Ticket, Box, Activity,
  ChevronLeft, ChevronRight, AlertCircle
} from "lucide-react";

const CATEGORY_COLORS = {
  BOOKING:  { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500"    },
  TICKET:   { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500"   },
  USER:     { bg: "bg-purple-100",  text: "text-purple-700",  dot: "bg-purple-500"  },
  RESOURCE: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  OTHER:    { bg: "bg-slate-100",   text: "text-slate-700",   dot: "bg-slate-400"   },
};

const CATEGORY_ICONS = { BOOKING: Calendar, TICKET: Ticket, USER: Users, RESOURCE: Box };

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="opacity-80" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value ?? "—"}</p>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function ActivityLog() {
  const [logs,    setLogs]    = useState([]);
  const [stats,   setStats]   = useState({});
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Filters
  const [category, setCategory] = useState("ALL");
  const [search,   setSearch]   = useState("");
  const [from,     setFrom]     = useState("");
  const [to,       setTo]       = useState("");

  // Pagination
  const [page,       setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const PAGE_SIZE = 20;

  // ---------- fetch stats ----------
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/admin/audit-logs/stats");
      setStats(res.data);
    } catch { /* silent */ }
  }, []);

  // ---------- fetch logs ----------
  const fetchLogs = useCallback(async (pg = 0) => {
    setLoading(true); setError(null);
    try {
      const params = { page: pg, size: PAGE_SIZE };
      if (category && category !== "ALL") params.category = category;
      if (search.trim()) params.search = search.trim();
      if (from) params.from = from;
      if (to)   params.to   = to;

      const res = await api.get("/admin/audit-logs", { params });
      const data = res.data;
      setLogs(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalElements || 0);
      setPage(pg);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, [category, search, from, to]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchLogs(0); }, [category, from, to]);

  // search debounce
  useEffect(() => {
    const t = setTimeout(() => fetchLogs(0), 400);
    return () => clearTimeout(t);
  }, [search]);

  // ---------- CSV export ----------
  const exportCSV = () => {
    const rows = [["ID","Timestamp","Category","Action","Actor","Role","Description","Entity","Entity ID"]];
    logs.forEach(l => rows.push([
      l.id, l.createdAt, l.category, l.actionLabel,
      l.actorName, l.actorRole,
      `"${(l.targetDescription||"").replace(/"/g,'""')}"`,
      l.entityType, l.entityId
    ]));
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `audit-log-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const resetFilters = () => { setCategory("ALL"); setSearch(""); setFrom(""); setTo(""); };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ClipboardList size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Activity & Audit Log</h1>
            <p className="text-sm text-slate-500 mt-0.5">Complete record of all system events</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { fetchStats(); fetchLogs(page); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={exportCSV}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-sm hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 transition-all"
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Events"  value={stats.total}     icon={Activity}  color="bg-indigo-100 text-indigo-600" />
        <StatCard label="Bookings"      value={stats.bookings}  icon={Calendar}  color="bg-blue-100 text-blue-600" />
        <StatCard label="Tickets"       value={stats.tickets}   icon={Ticket}    color="bg-amber-100 text-amber-600" />
        <StatCard label="Users"         value={stats.users}     icon={Users}     color="bg-purple-100 text-purple-600" />
        <StatCard label="Resources"     value={stats.resources} icon={Box}       color="bg-emerald-100 text-emerald-600" />
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          {/* Category tabs */}
          <div className="flex gap-1 flex-wrap">
            {["ALL","BOOKING","TICKET","USER","RESOURCE"].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                  category === cat
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-1 gap-2 flex-wrap">
            {/* Search */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-[180px] gap-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all">
              <Search size={14} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search actor or description…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 w-full"
              />
            </div>

            {/* Date range */}
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
            />
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
            />

            <button onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all whitespace-nowrap"
            >
              <Filter size={13} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-500">
            {loading ? "Loading…" : `${totalItems.toLocaleString()} event${totalItems !== 1 ? "s" : ""} found`}
          </p>
          {totalPages > 1 && (
            <p className="text-xs text-slate-400">Page {page + 1} of {totalPages}</p>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-3 m-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium">
            <AlertCircle size={18} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="divide-y divide-slate-50">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-4 px-5 py-4 animate-pulse">
                <div className="w-20 h-4 bg-slate-100 rounded-full" />
                <div className="w-16 h-4 bg-slate-100 rounded-full" />
                <div className="flex-1 h-4 bg-slate-100 rounded-full" />
                <div className="w-24 h-4 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <ClipboardList size={32} />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No events found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or date range</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Time</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Actor</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map(log => {
                  const colors = CATEGORY_COLORS[log.category] || CATEGORY_COLORS.OTHER;
                  const CatIcon = CATEGORY_ICONS[log.category] || Activity;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="text-xs font-semibold text-slate-600">{timeAgo(log.createdAt)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(log.createdAt)}</p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${colors.bg} ${colors.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                          <CatIcon size={11} />
                          {log.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {log.actionLabel || log.action}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0 border border-white shadow-sm">
                            {(log.actorName || "S").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-700">{log.actorName || "System"}</p>
                            <p className="text-[10px] text-slate-400">{log.actorRole || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 max-w-xs">
                        <p className="text-xs text-slate-600 truncate" title={log.targetDescription}>
                          {log.targetDescription || "—"}
                        </p>
                        {log.entityType && log.entityId && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{log.entityType} #{log.entityId}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => fetchLogs(page - 1)}
              disabled={page === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={15} /> Previous
            </button>
            <div className="flex gap-1">
              {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                const pg = totalPages <= 7 ? i : (page < 4 ? i : page - 3 + i);
                if (pg >= totalPages) return null;
                return (
                  <button key={pg} onClick={() => fetchLogs(pg)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                      pg === page ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {pg + 1}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => fetchLogs(page + 1)}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease both; }
      `}</style>
    </div>
  );
}
