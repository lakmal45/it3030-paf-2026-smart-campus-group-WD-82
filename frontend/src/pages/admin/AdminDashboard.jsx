import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  Ticket,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Wrench,
  UserCircle,
  Calendar,
  MapPin,
  ChevronRight,
  Building2,
  Activity,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import ticketService from "../../services/ticketService";
import bookingService from "../../services/bookingService";
import resourceService from "../../services/resourceService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtAgo = (d) => {
  if (!d) return "";
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const ROLE_CFG = {
  ADMIN: { color: "text-violet-600", bg: "bg-violet-50", Icon: ShieldCheck },
  MANAGER: { color: "text-blue-600", bg: "bg-blue-50", Icon: UserCircle },
  TECHNICIAN: { color: "text-emerald-600", bg: "bg-emerald-50", Icon: Wrench },
  USER: { color: "text-slate-600", bg: "bg-slate-100", Icon: Users },
};

const BOOKING_CFG = {
  CONFIRMED: { label: "Confirmed", badge: "bg-emerald-50 text-emerald-700" },
  PENDING: { label: "Pending", badge: "bg-amber-50 text-amber-700" },
  CANCELLED: { label: "Cancelled", badge: "bg-rose-50 text-rose-700" },
};

const CHART_COLORS = {
  OPEN: "#f59e0b",
  IN_PROGRESS: "#3b82f6",
  RESOLVED: "#10b981",
  CLOSED: "#94a3b8",
};

// ─── Page Loader ──────────────────────────────────────────────────────────────

const PageLoader = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "70vh",
      gap: 16,
    }}
  >
    <style>{`@keyframes ad-spin{to{transform:rotate(360deg)}}@keyframes ad-arc{0%,100%{stroke-dashoffset:150}50%{stroke-dashoffset:38}}`}</style>
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      style={{ animation: "ad-spin 2s linear infinite" }}
    >
      <circle
        cx="28"
        cy="28"
        r="24"
        fill="none"
        stroke="#e0e7ff"
        strokeWidth="4"
      />
      <circle
        cx="28"
        cy="28"
        r="24"
        fill="none"
        stroke="#6366f1"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="150"
        style={{
          animation: "ad-arc 1.6s ease-in-out infinite",
          transformOrigin: "center",
        }}
      />
    </svg>
    <p style={{ color: "#475569", fontWeight: 600, fontSize: "0.9rem" }}>
      Loading admin dashboard…
    </p>
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className }) => (
  <div className={`skeleton-shimmer rounded-lg ${className}`} />
);

const RowSkeleton = () => (
  <div className="flex items-center gap-3 p-3">
    <Skeleton className="w-9 h-9 flex-shrink-0 rounded-xl" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-2.5 w-2/5" />
    </div>
    <Skeleton className="h-5 w-16 rounded-full" />
  </div>
);

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const KpiCard = ({ label, value, sub, icon: Icon, accent, loading }) => {
  const C =
    {
      indigo: {
        bg: "bg-indigo-50",
        icon: "text-indigo-500",
        val: "text-indigo-600",
      },
      amber: {
        bg: "bg-amber-50",
        icon: "text-amber-500",
        val: "text-amber-600",
      },
      emerald: {
        bg: "bg-emerald-50",
        icon: "text-emerald-500",
        val: "text-emerald-600",
      },
      rose: { bg: "bg-rose-50", icon: "text-rose-500", val: "text-rose-600" },
      blue: { bg: "bg-blue-50", icon: "text-blue-500", val: "text-blue-600" },
      violet: {
        bg: "bg-violet-50",
        icon: "text-violet-500",
        val: "text-violet-600",
      },
      slate: {
        bg: "bg-slate-100",
        icon: "text-slate-500",
        val: "text-slate-700",
      },
    }[accent] || {};
  if (loading)
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <Skeleton className="h-3 w-20 mb-3" />
        <Skeleton className="h-8 w-12 mb-2" />
        <Skeleton className="h-3 w-28" />
      </div>
    );
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {label}
          </p>
          <p className={`mt-2 text-3xl font-bold ${C.val}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${C.bg} ${C.icon}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

// ─── Panel ────────────────────────────────────────────────────────────────────

const Panel = ({ title, action, onAction, children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}
  >
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
      <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      {action && (
        <button
          onClick={onAction}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          {action}
        </button>
      )}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const Empty = ({ icon: Icon, text }) => (
  <div className="flex flex-col items-center py-8 text-slate-400">
    <div className="p-3 bg-slate-50 rounded-xl mb-2">
      <Icon size={24} className="opacity-50" />
    </div>
    <p className="text-sm text-slate-500">{text}</p>
  </div>
);

// ─── Resource Row ─────────────────────────────────────────────────────────────

const ResourceRow = ({ resource, onClick, idx }) => {
  const isActive = resource.status === "ACTIVE";
  const avail = isActive && resource.available;
  const badge = avail
    ? "bg-emerald-50 text-emerald-700"
    : resource.status === "IN_MAINTENANCE"
      ? "bg-amber-50 text-amber-700"
      : resource.status === "OUT_OF_SERVICE"
        ? "bg-rose-50 text-rose-700"
        : "bg-amber-50 text-amber-700";
  const label = avail
    ? "Available"
    : resource.status === "IN_MAINTENANCE"
      ? "Maintenance"
      : resource.status === "OUT_OF_SERVICE"
        ? "Out of Service"
        : "Booked";
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group animate-card-enter stagger-${Math.min(idx + 1, 6)}`}
    >
      <div
        className={`p-2 rounded-lg flex-shrink-0 ${avail ? "bg-emerald-50" : "bg-amber-50"}`}
      >
        <Building2
          size={14}
          className={avail ? "text-emerald-500" : "text-amber-500"}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {resource.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {resource.location} · {resource.type} · Cap {resource.capacity}
        </p>
      </div>
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${badge}`}
      >
        {label}
      </span>
      <ChevronRight
        size={14}
        className="text-slate-300 group-hover:text-indigo-400 flex-shrink-0"
      />
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState(null);
  const [tickets, setTickets] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [resources, setResources] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [uRes, tRes, bData, rData, nRes] = await Promise.all([
        api.get("/admin/users"),
        ticketService.getAll(),
        bookingService.getAllBookings(),
        resourceService.getAllResources(),
        api.get("/notifications"),
      ]);
      setUsers(uRes.data);
      setTickets(tRes.data?.content ?? tRes.data);
      setBookings(Array.isArray(bData) ? bData : []);
      setResources(Array.isArray(rData) ? rData : []);
      setNotifications(nRes.data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Failed to load dashboard data.");
    } finally {
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (initialLoad) return <PageLoader />;

  // Derived
  const totalUsers = users?.length ?? 0;
  const totalTickets = tickets?.length ?? 0;
  const openTickets = tickets?.filter((t) => t.status === "OPEN").length ?? 0;
  const resolvedT =
    tickets?.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length ??
    0;
  const totalBookings = bookings?.length ?? 0;
  const pendingB = bookings?.filter((b) => b.status === "PENDING").length ?? 0;
  const confirmedB =
    bookings?.filter((b) => b.status === "CONFIRMED").length ?? 0;
  const totalRes = resources?.length ?? 0;
  const activeRes = resources?.filter((r) => r.status === "ACTIVE").length ?? 0;
  const maintRes =
    resources?.filter((r) => r.status === "IN_MAINTENANCE").length ?? 0;
  const outRes =
    resources?.filter((r) => r.status === "OUT_OF_SERVICE").length ?? 0;

  const roleCounts =
    users?.reduce((a, u) => {
      a[u.role] = (a[u.role] || 0) + 1;
      return a;
    }, {}) ?? {};
  const recentUsers = users
    ? [...users].sort((a, b) => b.id - a.id).slice(0, 5)
    : [];
  const recentActivity = notifications?.slice(0, 5) ?? [];
  const recentBookings = bookings?.slice(0, 5) ?? [];
  const recentResources = resources?.slice(0, 5) ?? [];

  const chartData = tickets
    ? [
        {
          name: "Open",
          count: tickets.filter((t) => t.status === "OPEN").length,
          fill: CHART_COLORS.OPEN,
        },
        {
          name: "In Progress",
          count: tickets.filter((t) => t.status === "IN_PROGRESS").length,
          fill: CHART_COLORS.IN_PROGRESS,
        },
        {
          name: "Resolved",
          count: tickets.filter((t) => t.status === "RESOLVED").length,
          fill: CHART_COLORS.RESOLVED,
        },
        {
          name: "Closed",
          count: tickets.filter((t) => t.status === "CLOSED").length,
          fill: CHART_COLORS.CLOSED,
        },
      ]
    : [];

  const dotColors = [
    "bg-emerald-400",
    "bg-indigo-400",
    "bg-amber-400",
    "bg-blue-400",
    "bg-rose-400",
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            System Administration
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time overview of your Smart Campus platform
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-40"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* ── Top KPI Row: 4 columns ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Users"
          value={totalUsers}
          sub={`${roleCounts.ADMIN || 0} admins · ${roleCounts.TECHNICIAN || 0} techs`}
          icon={Users}
          accent="violet"
          loading={refreshing}
        />
        <KpiCard
          label="Total Tickets"
          value={totalTickets}
          sub={`${openTickets} open · ${resolvedT} resolved`}
          icon={Ticket}
          accent="amber"
          loading={refreshing}
        />
        <KpiCard
          label="Total Bookings"
          value={totalBookings}
          sub={`${pendingB} pending · ${confirmedB} confirmed`}
          icon={Calendar}
          accent="indigo"
          loading={refreshing}
        />
        <KpiCard
          label="Resources"
          value={totalRes}
          sub={`${activeRes} active · ${maintRes} maintenance`}
          icon={Building2}
          accent="blue"
          loading={refreshing}
        />
      </div>

      {/* ── Secondary KPI Row: resource detail ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Open Tickets"
          value={openTickets}
          sub="Requiring attention"
          icon={Clock}
          accent="amber"
          loading={refreshing}
        />
        <KpiCard
          label="Pending Bookings"
          value={pendingB}
          sub="Awaiting approval"
          icon={Clock}
          accent="amber"
          loading={refreshing}
        />
        <KpiCard
          label="Active Resources"
          value={activeRes}
          sub="Ready to use"
          icon={CheckCircle}
          accent="emerald"
          loading={refreshing}
        />
        <KpiCard
          label="Out of Service"
          value={outRes}
          sub="Unavailable"
          icon={AlertCircle}
          accent="rose"
          loading={refreshing}
        />
      </div>

      {/* ── Chart + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <Panel title="Ticket Status Breakdown" className="lg:col-span-2">
          {refreshing ? (
            <div className="h-56 flex items-end gap-4 px-4 pb-2">
              {[60, 40, 80, 30].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end gap-1">
                  <Skeleton className="rounded-t" style={{ height: `${h}%` }} />
                  <Skeleton className="h-3" />
                </div>
              ))}
            </div>
          ) : !tickets || tickets.length === 0 ? (
            <Empty icon={Ticket} text="No tickets in the system yet" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                  barSize={36}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,.08)",
                    }}
                    cursor={{ fill: "#f8fafc" }}
                  />
                  <Bar dataKey="count" name="Tickets" radius={[6, 6, 0, 0]}>
                    {chartData.map((e, i) => (
                      <Cell key={i} fill={e.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2 px-2">
                {chartData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: d.fill }}
                    />
                    <span className="text-xs text-slate-500">
                      {d.name}: <strong>{d.count}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Panel>

        {/* Recent Activity */}
        <Panel title="Recent Activity">
          {refreshing ? (
            [1, 2, 3, 4].map((i) => <RowSkeleton key={i} />)
          ) : recentActivity.length === 0 ? (
            <Empty icon={Activity} text="No recent activity" />
          ) : (
            <div className="space-y-4">
              {recentActivity.map((n, i) => (
                <div
                  key={n.id}
                  className={`flex gap-3 animate-card-enter stagger-${Math.min(i + 1, 6)}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${dotColors[i % dotColors.length]}`}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800 leading-snug">
                      {n.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {fmtAgo(n.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* ── User Role Overview (full-width) ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">User Role Overview</h2>
            <p className="text-xs text-slate-400 mt-0.5">Distribution of {totalUsers} registered users across all roles</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/admin/users")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
          >
            Manage All Users <ChevronRight size={13} />
          </button>
        </div>

        {/* Role stat cards */}
        {refreshing ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"><Skeleton className="h-3 w-20 mb-3" /><Skeleton className="h-8 w-12 mb-2" /><Skeleton className="h-2 w-full rounded-full" /></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { role: "ADMIN",      label: "Admins",      desc: "Full system access",      accent: { card: "from-violet-50 to-purple-50", border: "border-violet-100", val: "text-violet-700", bar: "bg-violet-500", badge: "bg-violet-100 text-violet-700" } },
              { role: "MANAGER",    label: "Managers",    desc: "Oversee operations",       accent: { card: "from-blue-50 to-sky-50",    border: "border-blue-100",   val: "text-blue-700",   bar: "bg-blue-500",   badge: "bg-blue-100 text-blue-700"   } },
              { role: "TECHNICIAN", label: "Technicians", desc: "Handle maintenance",       accent: { card: "from-emerald-50 to-teal-50", border: "border-emerald-100", val: "text-emerald-700", bar: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" } },
              { role: "USER",       label: "Users",       desc: "Submit & track tickets",  accent: { card: "from-slate-50 to-gray-50",  border: "border-slate-100",  val: "text-slate-700",  bar: "bg-slate-500",  badge: "bg-slate-100 text-slate-600"  } },
            ].map(({ role, label, desc, accent }, i) => {
              const cfg = ROLE_CFG[role];
              const Icon = cfg.Icon;
              const count = roleCounts[role] || 0;
              const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
              const usersInRole = users ? users.filter(u => u.role === role).slice(0, 3) : [];
              return (
                <div
                  key={role}
                  onClick={() => navigate("/dashboard/admin/users")}
                  className={`bg-gradient-to-br ${accent.card} border ${accent.border} rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all group animate-card-enter stagger-${i+1}`}
                >
                  {/* Icon + badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${cfg.bg}`}>
                      <Icon size={18} className={cfg.color} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${accent.badge}`}>{pct}%</span>
                  </div>

                  {/* Count */}
                  <p className={`text-3xl font-extrabold ${accent.val} mb-0.5`}>{count}</p>
                  <p className="text-sm font-semibold text-slate-700">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 mb-3">{desc}</p>

                  {/* Progress bar */}
                  <div className="w-full bg-white/70 rounded-full h-1.5 mb-3">
                    <div className={`${accent.bar} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>

                  {/* Mini avatars */}
                  {usersInRole.length > 0 && (
                    <div className="flex items-center gap-1">
                      {usersInRole.map((u, idx) => {
                        const ini = u.name ? u.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) : u.email?.[0]?.toUpperCase() || "?";
                        return (
                          <div key={u.id} className={`w-6 h-6 rounded-full ${cfg.bg} ${cfg.color} flex items-center justify-center text-[10px] font-bold border-2 border-white -ml-${idx > 0 ? 1 : 0}`}>
                            {ini}
                          </div>
                        );
                      })}
                      {count > 3 && <span className="text-[10px] text-slate-400 ml-1.5 font-medium">+{count - 3} more</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed user breakdown table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <h3 className="text-sm font-semibold text-slate-800">All Users by Role</h3>
            <div className="flex items-center gap-2">
              {["ADMIN","MANAGER","TECHNICIAN","USER"].map(role => {
                const cfg = ROLE_CFG[role];
                return (
                  <span key={role} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                    {role}: {roleCounts[role] || 0}
                  </span>
                );
              })}
            </div>
          </div>
          {refreshing ? (
            <div className="p-4 space-y-1">{[1,2,3,4,5].map(i => <RowSkeleton key={i} />)}</div>
          ) : !users || users.length === 0 ? (
            <div className="py-12"><Empty icon={Users} text="No users registered yet" /></div>
          ) : (
            <div className="divide-y divide-slate-50">
              {["ADMIN","MANAGER","TECHNICIAN","USER"].map(role => {
                const cfg = ROLE_CFG[role];
                const Icon = cfg.Icon;
                const roleUsers = users.filter(u => u.role === role);
                if (roleUsers.length === 0) return null;
                return (
                  <div key={role}>
                    {/* Role section header */}
                    <div className={`flex items-center gap-2 px-6 py-2 ${cfg.bg}`}>
                      <Icon size={13} className={cfg.color} />
                      <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>{role}</span>
                      <span className={`ml-auto text-xs font-semibold ${cfg.color}`}>{roleUsers.length} user{roleUsers.length !== 1 ? "s" : ""}</span>
                    </div>
                    {/* Users in this role */}
                    <div>
                      {roleUsers.slice(0, 4).map((u, i) => {
                        const ini = u.name ? u.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) : u.email?.[0]?.toUpperCase() || "?";
                        return (
                          <div key={u.id} className={`flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors animate-card-enter stagger-${Math.min(i+1,6)}`}>
                            <div className={`w-9 h-9 rounded-full ${cfg.bg} ${cfg.color} flex items-center justify-center font-bold text-xs flex-shrink-0`}>
                              {ini}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{u.name || "—"}</p>
                              <p className="text-xs text-slate-400 truncate">{u.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{role}</span>
                              <ChevronRight size={13} className="text-slate-300" />
                            </div>
                          </div>
                        );
                      })}
                      {roleUsers.length > 4 && (
                        <div className="px-6 py-2">
                          <button onClick={() => navigate("/dashboard/admin/users")} className={`text-xs font-semibold ${cfg.color} hover:underline`}>
                            +{roleUsers.length - 4} more {role.toLowerCase()}s →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Bookings + Resources ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Panel
          title="Recent Bookings"
          action="View All →"
          onAction={() => navigate("/dashboard/admin/bookings")}
        >
          {refreshing ? (
            [1, 2, 3].map((i) => <RowSkeleton key={i} />)
          ) : recentBookings.length === 0 ? (
            <Empty icon={Calendar} text="No bookings yet" />
          ) : (
            recentBookings.map((b, i) => {
              const cfg = BOOKING_CFG[b.status] || BOOKING_CFG.PENDING;
              return (
                <div
                  key={b.id}
                  onClick={() => navigate("/dashboard/admin/bookings")}
                  className={`flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group animate-card-enter stagger-${Math.min(i + 1, 6)}`}
                >
                  <div className="p-2 bg-indigo-50 rounded-lg flex-shrink-0">
                    <MapPin size={13} className="text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {b.resource}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {b.userName || "—"} · {b.date}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}
                  >
                    {cfg.label}
                  </span>
                </div>
              );
            })
          )}
        </Panel>

        {/* Recent Resources */}
        <Panel
          title="Resource Snapshot"
          action="Manage →"
          onAction={() => navigate("/dashboard/admin/resources")}
        >
          {refreshing ? (
            [1, 2, 3].map((i) => <RowSkeleton key={i} />)
          ) : recentResources.length === 0 ? (
            <Empty icon={Building2} text="No resources found" />
          ) : (
            recentResources.map((r, i) => (
              <ResourceRow
                key={r.id}
                resource={r}
                idx={i}
                onClick={() => navigate("/dashboard/admin/resources")}
              />
            ))
          )}
        </Panel>
      </div>


    </div>
  );
};

export default AdminDashboard;
