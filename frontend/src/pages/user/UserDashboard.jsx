import React, { useEffect, useState, useCallback } from "react";
import {
  Bell,
  ChevronRight,
  Ticket,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Calendar,
  MapPin,
  Plus,
  Building2,
  Wrench,
  LayoutGrid,
  ListChecks,
  BookOpen,
  Search,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ticketService from "../../services/ticketService";
import bookingService from "../../services/bookingService";
import resourceService from "../../services/resourceService";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  OPEN: {
    label: "Open",
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700",
  },
  IN_PROGRESS: {
    label: "In Progress",
    dot: "bg-blue-400",
    badge: "bg-blue-50 text-blue-700",
  },
  RESOLVED: {
    label: "Resolved",
    dot: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-700",
  },
  CLOSED: {
    label: "Closed",
    dot: "bg-slate-300",
    badge: "bg-slate-100 text-slate-600",
  },
};

const BOOKING_CFG = {
  CONFIRMED: { label: "Confirmed", badge: "bg-emerald-50 text-emerald-700" },
  PENDING: { label: "Pending", badge: "bg-amber-50 text-amber-700" },
  CANCELLED: { label: "Cancelled", badge: "bg-rose-50 text-rose-700" },
};

const fmtAgo = (d) => {
  if (!d) return "";
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
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
    <style>{`@keyframes ud-spin{to{transform:rotate(360deg)}}@keyframes ud-arc{0%,100%{stroke-dashoffset:220}50%{stroke-dashoffset:55}}`}</style>
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      style={{ animation: "ud-spin 2s linear infinite" }}
    >
      <circle cx="28" cy="28" r="24" fill="none" stroke="#e0e7ff" strokeWidth="4" />
      <circle
        cx="28" cy="28" r="24" fill="none" stroke="#6366f1" strokeWidth="4"
        strokeLinecap="round" strokeDasharray="150"
        style={{ animation: "ud-arc 1.6s ease-in-out infinite", transformOrigin: "center" }}
      />
    </svg>
    <p style={{ color: "#475569", fontWeight: 600, fontSize: "0.9rem" }}>
      Loading your dashboard…
    </p>
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className }) => (
  <div className={`skeleton-shimmer rounded-lg ${className}`} />
);

const RowSkeleton = () => (
  <div className="flex items-center gap-3 p-3">
    <Skeleton className="w-8 h-8 flex-shrink-0 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-2.5 w-2/5" />
    </div>
    <Skeleton className="h-5 w-16 rounded-full" />
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, icon: Icon, accent, loading }) => {
  const colors = {
    amber:   { bg: "bg-amber-50",   icon: "text-amber-500",   val: "text-amber-600",   border: "border-amber-100"   },
    blue:    { bg: "bg-blue-50",    icon: "text-blue-500",    val: "text-blue-600",    border: "border-blue-100"    },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-500", val: "text-emerald-600", border: "border-emerald-100" },
    rose:    { bg: "bg-rose-50",    icon: "text-rose-500",    val: "text-rose-600",    border: "border-rose-100"    },
    indigo:  { bg: "bg-indigo-50",  icon: "text-indigo-500",  val: "text-indigo-600",  border: "border-indigo-100"  },
  };
  const c = colors[accent] || colors.indigo;

  if (loading)
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <Skeleton className="h-3 w-20 mb-3" />
        <Skeleton className="h-8 w-12 mb-2" />
        <Skeleton className="h-3 w-28" />
      </div>
    );

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${c.border} hover:shadow-md transition-all group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className={`mt-2 text-3xl font-bold ${c.val}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${c.bg} ${c.icon}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

// ─── Panel ────────────────────────────────────────────────────────────────────

const Panel = ({ title, action, onAction, children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
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

const Empty = ({ icon: Icon, text, sub, cta, onCta }) => (
  <div className="flex flex-col items-center py-10 text-slate-400">
    <div className="p-4 bg-slate-50 rounded-2xl mb-3">
      <Icon size={28} className="opacity-40" />
    </div>
    <p className="text-sm font-medium text-slate-500">{text}</p>
    {sub && <p className="text-xs text-slate-400 mt-1 text-center">{sub}</p>}
    {cta && (
      <button
        onClick={onCta}
        className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
      >
        {cta}
      </button>
    )}
  </div>
);

// ─── Ticket Row ───────────────────────────────────────────────────────────────

const TicketRow = ({ ticket, onClick, idx }) => {
  const cfg = STATUS_CFG[ticket.status] || STATUS_CFG.OPEN;
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group animate-card-enter stagger-${Math.min(idx + 1, 6)} border-b border-slate-50 last:border-0`}
    >
      {/* Status icon */}
      <div className="p-2 bg-amber-50 rounded-lg flex-shrink-0">
        <Ticket size={14} className="text-amber-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{ticket.title}</p>
        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          <span className={`font-medium ${cfg.badge.split(" ")[1]}`}>{cfg.label}</span>
          <span className="text-slate-300">·</span>
          <span>{ticket.category}</span>
          <span className="text-slate-300">·</span>
          <span>{fmtAgo(ticket.createdAt)}</span>
        </p>
      </div>
      <ChevronRight
        size={14}
        className="text-slate-300 group-hover:text-indigo-400 flex-shrink-0 transition-colors"
      />
    </div>
  );
};

// ─── Booking Row ──────────────────────────────────────────────────────────────

const BookingRow = ({ booking, onClick, idx }) => {
  const cfg = BOOKING_CFG[booking.status] || BOOKING_CFG.PENDING;
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group animate-card-enter stagger-${Math.min(idx + 1, 6)} border-b border-slate-50 last:border-0`}
    >
      <div className="p-2 bg-indigo-50 rounded-lg flex-shrink-0">
        <MapPin size={14} className="text-indigo-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{booking.resource}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {booking.date} · {booking.startTime?.substring(0, 5)}–{booking.endTime?.substring(0, 5)}
        </p>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.badge}`}>
        {cfg.label}
      </span>
      <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
    </div>
  );
};

// ─── Resource Row ─────────────────────────────────────────────────────────────

// ─── Resource Card ─────────────────────────────────────────────────────────────

const ResourceCard = ({ resource, onClick }) => {
  const avail = resource.available && resource.status === "ACTIVE";
  
  const statusCfg = {
    ACTIVE: avail ? 
      { label: "Available", badge: "bg-emerald-50 text-emerald-700", icon: CheckCircle, iconColor: "text-emerald-500" } :
      { label: "Booked", badge: "bg-blue-50 text-blue-700", icon: Clock, iconColor: "text-blue-500" },
    IN_MAINTENANCE: { label: "Maintenance", badge: "bg-amber-50 text-amber-700", icon: Wrench, iconColor: "text-amber-500" },
    OUT_OF_SERVICE: { label: "Out of Order", badge: "bg-rose-50 text-rose-700", icon: AlertCircle, iconColor: "text-rose-500" }
  };
  
  const cfg = statusCfg[resource.status] || statusCfg.ACTIVE;

  return (
    <div 
      onClick={() => onClick(resource)}
      className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-lg hover:border-indigo-100 transition-all cursor-pointer group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${avail ? "bg-indigo-50" : "bg-slate-50"} transition-colors group-hover:bg-indigo-50`}>
          <Building2 size={24} className={avail ? "text-indigo-600" : "text-slate-400"} />
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {resource.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-1 text-slate-500">
          <MapPin size={12} className="shrink-0" />
          <p className="text-xs truncate">{resource.location}</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Users size={12} />
            <span className="text-[11px] font-medium">{resource.capacity} seats</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <BookOpen size={12} />
            <span className="text-[11px] font-medium truncate">{resource.type}</span>
          </div>
        </div>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onClick(resource);
        }}
        className="mt-4 w-full py-2 bg-slate-50 group-hover:bg-indigo-600 text-slate-600 group-hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        {avail ? "Book This Space" : "View Schedule"}
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

const ResourceCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col h-full">
    <div className="flex justify-between items-start mb-4">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <Skeleton className="w-20 h-6 rounded-full" />
    </div>
    <div className="space-y-2 mb-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <div className="mt-auto pt-4 border-t border-slate-50 flex gap-3">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-12" />
    </div>
    <Skeleton className="mt-4 h-9 w-full rounded-xl" />
  </div>
);

// ─── TABS ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview",   label: "Overview",    Icon: LayoutGrid  },
  { id: "tickets",    label: "My Tickets",  Icon: ListChecks  },
  { id: "bookings",   label: "Bookings",    Icon: Calendar    },
  { id: "resources",  label: "Resources",   Icon: Building2   },
];

// ─── Component ────────────────────────────────────────────────────────────────

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [tickets, setTickets] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [resources, setResources] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Resources state
  const [resSearch, setResSearch] = useState("");
  const [resCategory, setResCategory] = useState("All");

  const fetchData = useCallback(async () => {
    try {
      const [tRes, bData, rData, nRes, cRes] = await Promise.all([
        ticketService.getAll(),
        bookingService.getMyBookings(),
        resourceService.getAllResources(),
        api.get("/notifications"),
        api.get("/notifications/unread-count"),
      ]);
      setTickets(tRes.data?.content ?? tRes.data);
      setBookings(Array.isArray(bData) ? bData : []);
      setResources(Array.isArray(rData) ? rData : []);
      setNotifications(nRes.data);
      setUnreadCount(cRes.data ?? 0);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (initialLoad) return <PageLoader />;

  // Derived stats
  const openT      = tickets?.filter((t) => t.status === "OPEN").length ?? 0;
  const inProgT    = tickets?.filter((t) => t.status === "IN_PROGRESS").length ?? 0;
  const resolvedT  = tickets?.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length ?? 0;
  const confirmedB = bookings?.filter((b) => b.status === "CONFIRMED").length ?? 0;
  const pendingB   = bookings?.filter((b) => b.status === "PENDING").length ?? 0;
  const availR     = resources?.filter((r) => r.status === "ACTIVE" && r.available).length ?? 0;
  const maintR     = resources?.filter((r) => r.status === "IN_MAINTENANCE").length ?? 0;

  const recentTickets   = tickets?.slice(0, 6) ?? [];
  const recentBookings  = bookings?.slice(0, 5) ?? [];
  const recentResources = resources?.filter((r) => r.status === "ACTIVE").slice(0, 5) ?? [];
  const recentNotifs    = notifications?.slice(0, 6) ?? [];

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {user?.name ? `Welcome back, ${user.name.split(" ")[0]} 👋` : "My Dashboard"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here's what's happening with your campus services.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard/user/create-ticket")}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={15} /> New Ticket
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-40"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === id
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          OVERVIEW TAB
      ══════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6">

          {/* ── 4 Stat Cards matching photo ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Open Tickets"
              value={openT}
              sub="Awaiting resolution"
              icon={Ticket}
              accent="amber"
              loading={refreshing}
            />
            <StatCard
              label="In Progress"
              value={inProgT}
              sub="Being handled"
              icon={Clock}
              accent="blue"
              loading={refreshing}
            />
            <StatCard
              label="Resolved"
              value={resolvedT}
              sub="Completed issues"
              icon={CheckCircle}
              accent="emerald"
              loading={refreshing}
            />
            <StatCard
              label="Alerts"
              value={unreadCount}
              sub="Unread notifications"
              icon={Bell}
              accent="rose"
              loading={refreshing}
            />
          </div>

          {/* ── Main 2-col: My Recent Tickets + Recent Notifications ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* My Recent Tickets — wider (3/5) */}
            <Panel
              title="My Recent Tickets"
              action="View All Tickets →"
              onAction={() => navigate("/tickets")}
              className="lg:col-span-3"
            >
              {refreshing ? (
                [1, 2, 3, 4, 5].map((i) => <RowSkeleton key={i} />)
              ) : recentTickets.length === 0 ? (
                <Empty
                  icon={Ticket}
                  text="No tickets yet"
                  sub="Submit a ticket when you spot a campus issue."
                  cta="Create Ticket"
                  onCta={() => navigate("/dashboard/user/create-ticket")}
                />
              ) : (
                <>
                  {recentTickets.map((t, i) => (
                    <TicketRow
                      key={t.id}
                      ticket={t}
                      idx={i}
                      onClick={() => navigate("/tickets")}
                    />
                  ))}
                  <div className="pt-2 text-center">
                    <button
                      onClick={() => navigate("/tickets")}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      View All Tickets →
                    </button>
                  </div>
                </>
              )}
            </Panel>

            {/* Recent Notifications — narrower (2/5) */}
            <Panel
              title="Recent Notifications"
              action="View All Notifications →"
              onAction={() => navigate("/notifications")}
              className="lg:col-span-2"
            >
              {refreshing ? (
                [1, 2, 3].map((i) => <RowSkeleton key={i} />)
              ) : recentNotifs.length === 0 ? (
                <Empty
                  icon={Bell}
                  text="No notifications yet"
                />
              ) : (
                <div className="space-y-3">
                  {recentNotifs.map((n, i) => (
                    <div
                      key={n.id}
                      className={`flex gap-3 animate-card-enter stagger-${Math.min(i + 1, 6)}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${n.read ? "bg-slate-200" : "bg-indigo-500"}`}
                      />
                      <div className="min-w-0">
                        <p className={`text-sm ${n.read ? "text-slate-500" : "text-slate-800 font-medium"} leading-snug`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{fmtAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-50">
                    <button
                      onClick={() => navigate("/notifications")}
                      className="w-full text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors text-center"
                    >
                      View All Notifications →
                    </button>
                  </div>
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MY TICKETS TAB
      ══════════════════════════════════════════════════════ */}
      {activeTab === "tickets" && (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Open"        value={openT}     sub="Awaiting resolution" icon={Ticket}      accent="amber"   loading={refreshing} />
            <StatCard label="In Progress" value={inProgT}   sub="Being handled"       icon={Clock}       accent="blue"    loading={refreshing} />
            <StatCard label="Resolved"    value={resolvedT} sub="Completed"           icon={CheckCircle} accent="emerald" loading={refreshing} />
          </div>

          <Panel title="All My Tickets" action="+ New Ticket" onAction={() => navigate("/dashboard/user/create-ticket")}>
            {refreshing ? (
              [1, 2, 3, 4, 5].map((i) => <RowSkeleton key={i} />)
            ) : recentTickets.length === 0 ? (
              <Empty icon={Ticket} text="No tickets yet" cta="Create Ticket" onCta={() => navigate("/dashboard/user/create-ticket")} />
            ) : (
              tickets?.map((t, i) => (
                <TicketRow key={t.id} ticket={t} idx={i} onClick={() => navigate("/tickets")} />
              ))
            )}
          </Panel>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          BOOKINGS TAB
      ══════════════════════════════════════════════════════ */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total"     value={bookings?.length ?? 0} sub="All bookings"   icon={Calendar}     accent="indigo"  loading={refreshing} />
            <StatCard label="Confirmed" value={confirmedB}             sub="Active bookings" icon={CheckCircle} accent="emerald" loading={refreshing} />
            <StatCard label="Pending"   value={pendingB}               sub="Awaiting approval" icon={Clock}    accent="amber"   loading={refreshing} />
          </div>

          <Panel title="My Bookings" action="+ New Booking" onAction={() => navigate("/dashboard/user/create-booking")}>
            {refreshing ? (
              [1, 2, 3].map((i) => <RowSkeleton key={i} />)
            ) : recentBookings.length === 0 ? (
              <Empty icon={Calendar} text="No bookings yet" sub="Reserve campus resources anytime." cta="Create Booking" onCta={() => navigate("/dashboard/user/create-booking")} />
            ) : (
              bookings?.map((b, i) => (
                <BookingRow key={b.id} booking={b} idx={i} onClick={() => navigate("/dashboard/user/bookings")} />
              ))
            )}
          </Panel>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          RESOURCES TAB
      ══════════════════════════════════════════════════════ */}
      {activeTab === "resources" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Resource Filtering Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <input
                type="text"
                placeholder="Search by name, type, or location..."
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all shadow-sm"
                value={resSearch}
                onChange={(e) => setResSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {["All", ...new Set(resources?.map(r => r.type) || [])].map(cat => (
                <button
                  key={cat}
                  onClick={() => setResCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    resCategory === cat 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105" 
                    : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Resources" value={resources?.length ?? 0} sub="On campus"      icon={Building2}   accent="indigo"    loading={refreshing} />
            <StatCard label="Available Now"   value={availR}                  sub="Ready to book"  icon={CheckCircle} accent="emerald" loading={refreshing} />
            <StatCard label="In Maintenance"  value={maintR}                  sub="Being serviced" icon={Wrench}      accent="amber"   loading={refreshing} />
            <StatCard label="Out of Order"    value={resources?.filter(r => r.status === "OUT_OF_SERVICE").length ?? 0} sub="Need attention" icon={AlertCircle} accent="rose" loading={refreshing} />
          </div>

          {/* Grid View */}
          <div className="min-h-[400px]">
            {refreshing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <ResourceCardSkeleton key={i} />)}
              </div>
            ) : (() => {
              const filtered = resources?.filter(r => {
                const matchesSearch = !resSearch || 
                  r.name.toLowerCase().includes(resSearch.toLowerCase()) ||
                  r.location.toLowerCase().includes(resSearch.toLowerCase()) ||
                  r.type.toLowerCase().includes(resSearch.toLowerCase());
                const matchesCat = resCategory === "All" || r.type === resCategory;
                return matchesSearch && matchesCat;
              });

              if (!filtered || filtered.length === 0) {
                return (
                  <div className="bg-white rounded-3xl border border-slate-100 py-20 shadow-sm">
                    <Empty 
                      icon={Search} 
                      text="No matches found" 
                      sub={resSearch ? `We couldn't find anything matching "${resSearch}"` : "Try adjusting your filters"} 
                      cta={resSearch || resCategory !== "All" ? "Clear Filters" : "Browse All"}
                      onCta={() => { setResSearch(""); setResCategory("All"); }}
                    />
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filtered.map((r) => (
                    <ResourceCard 
                      key={r.id} 
                      resource={r} 
                      onClick={(res) => {
                        if (res.available && res.status === 'ACTIVE') {
                          navigate("/dashboard/user/create-booking", { state: { resourceName: res.name } });
                        } else {
                          navigate("/dashboard/user/resources");
                        }
                      }} 
                    />
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;
