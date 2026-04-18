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
  BookOpen,
  TrendingUp,
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
  return `${Math.floor(h / 24)}d ago`;
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
          animation: "ud-arc 1.6s ease-in-out infinite",
          transformOrigin: "center",
        }}
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

// ─── Stat Card ────────────────────────────────────────────────────────────────

const KpiCard = ({ label, value, sub, icon: Icon, accent, loading }) => {
  const colors = {
    indigo: {
      bg: "bg-indigo-50",
      icon: "text-indigo-500",
      val: "text-indigo-600",
    },
    amber: { bg: "bg-amber-50", icon: "text-amber-500", val: "text-amber-600" },
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
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {label}
          </p>
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

const Panel = ({ title, action, onAction, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
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

const Empty = ({ icon: Icon, text, sub, cta, onCta }) => (
  <div className="flex flex-col items-center py-10 text-slate-400">
    <div className="p-4 bg-slate-50 rounded-2xl mb-3">
      <Icon size={28} className="opacity-50" />
    </div>
    <p className="text-sm font-semibold text-slate-600">{text}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
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

// ─── Row items ────────────────────────────────────────────────────────────────

const TicketRow = ({ ticket, onClick, idx }) => {
  const cfg = STATUS_CFG[ticket.status] || STATUS_CFG.OPEN;
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group animate-card-enter stagger-${Math.min(idx + 1, 6)}`}
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {ticket.title}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {ticket.category} · {fmtAgo(ticket.createdAt)}
        </p>
      </div>
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.badge}`}
      >
        {cfg.label}
      </span>
      <ChevronRight
        size={14}
        className="text-slate-300 group-hover:text-indigo-400 flex-shrink-0 transition-colors"
      />
    </div>
  );
};

const BookingRow = ({ booking, onClick, idx }) => {
  const cfg = BOOKING_CFG[booking.status] || BOOKING_CFG.PENDING;
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group animate-card-enter stagger-${Math.min(idx + 1, 6)}`}
    >
      <div className="p-2 bg-indigo-50 rounded-lg flex-shrink-0">
        <MapPin size={14} className="text-indigo-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {booking.resource}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {booking.date} · {booking.startTime?.substring(0, 5)}–
          {booking.endTime?.substring(0, 5)}
        </p>
      </div>
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.badge}`}
      >
        {cfg.label}
      </span>
      <ChevronRight
        size={14}
        className="text-slate-300 group-hover:text-indigo-400 flex-shrink-0 transition-colors"
      />
    </div>
  );
};

const ResourceRow = ({ resource, onClick, idx }) => {
  const avail = resource.available && resource.status === "ACTIVE";
  const badge = avail
    ? "bg-emerald-50 text-emerald-700"
    : resource.status === "IN_MAINTENANCE"
      ? "bg-amber-50 text-amber-700"
      : "bg-rose-50 text-rose-700";
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
        className="text-slate-300 group-hover:text-indigo-400 flex-shrink-0 transition-colors"
      />
    </div>
  );
};

const RowSkeleton = () => (
  <div className="flex items-center gap-3 p-3">
    <Skeleton className="w-8 h-8 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-2.5 w-2/5" />
    </div>
    <Skeleton className="h-5 w-16 rounded-full" />
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [resources, setResources] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

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
  const openT = tickets?.filter((t) => t.status === "OPEN").length ?? 0;
  const inProgT =
    tickets?.filter((t) => t.status === "IN_PROGRESS").length ?? 0;
  const resolvedT =
    tickets?.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length ??
    0;
  const confirmedB =
    bookings?.filter((b) => b.status === "CONFIRMED").length ?? 0;
  const pendingB = bookings?.filter((b) => b.status === "PENDING").length ?? 0;
  const availR =
    resources?.filter((r) => r.status === "ACTIVE" && r.available).length ?? 0;
  const maintR =
    resources?.filter((r) => r.status === "IN_MAINTENANCE").length ?? 0;

  const recentTickets = tickets?.slice(0, 6) ?? [];
  const recentBookings = bookings?.slice(0, 5) ?? [];
  const recentResources =
    resources?.filter((r) => r.status === "ACTIVE").slice(0, 5) ?? [];
  const recentNotifs = notifications?.slice(0, 6) ?? [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {user?.name
              ? `Hey, ${user.name.split(" ")[0]}! 👋`
              : "My Dashboard"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Your campus activity at a glance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard/user/create-booking")}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={15} /> New Booking
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

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Open Tickets"
          value={openT}
          sub={`${inProgT} in progress`}
          icon={Ticket}
          accent="amber"
          loading={refreshing}
        />
        <KpiCard
          label="Resolved"
          value={resolvedT}
          sub="Tickets closed"
          icon={CheckCircle}
          accent="emerald"
          loading={refreshing}
        />
        <KpiCard
          label="My Bookings"
          value={bookings?.length ?? 0}
          sub={`${confirmedB} confirmed · ${pendingB} pending`}
          icon={Calendar}
          accent="indigo"
          loading={refreshing}
        />
        <KpiCard
          label="Alerts"
          value={unreadCount}
          sub="Unread notifications"
          icon={Bell}
          accent="rose"
          loading={refreshing}
        />
      </div>

      {/* ── Resource Quick Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard
          label="Total Resources"
          value={resources?.length ?? 0}
          sub="On campus"
          icon={Building2}
          accent="blue"
          loading={refreshing}
        />
        <KpiCard
          label="Available Now"
          value={availR}
          sub="Ready to book"
          icon={CheckCircle}
          accent="emerald"
          loading={refreshing}
        />
        <KpiCard
          label="In Maintenance"
          value={maintR}
          sub="Being serviced"
          icon={Wrench}
          accent="amber"
          loading={refreshing}
        />
      </div>

      {/* ── Main Grid: Tickets + Notifications ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Tickets — wider */}
        <div className="lg:col-span-3">
          <Panel
            title="Recent Tickets"
            action="View All →"
            onAction={() => navigate("/tickets")}
          >
            {refreshing ? (
              [1, 2, 3, 4].map((i) => <RowSkeleton key={i} />)
            ) : recentTickets.length === 0 ? (
              <Empty
                icon={Ticket}
                text="No tickets yet"
                sub="Submit a ticket when you spot a campus issue."
              />
            ) : (
              recentTickets.map((t, i) => (
                <TicketRow
                  key={t.id}
                  ticket={t}
                  idx={i}
                  onClick={() => navigate("/tickets")}
                />
              ))
            )}
          </Panel>
        </div>

        {/* Notifications — narrower */}
        <div className="lg:col-span-2">
          <Panel
            title="Notifications"
            action="See All →"
            onAction={() => navigate("/notifications")}
          >
            {refreshing ? (
              [1, 2, 3, 4].map((i) => <RowSkeleton key={i} />)
            ) : recentNotifs.length === 0 ? (
              <Empty icon={Bell} text="No notifications" />
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
                      <p
                        className={`text-sm ${n.read ? "text-slate-500" : "text-slate-800 font-medium"} leading-snug`}
                      >
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
      </div>

      {/* ── Bottom Grid: Bookings + Resources ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Bookings */}
        <Panel
          title="My Bookings"
          action="View All →"
          onAction={() => navigate("/dashboard/user/bookings")}
        >
          {refreshing ? (
            [1, 2, 3].map((i) => <RowSkeleton key={i} />)
          ) : recentBookings.length === 0 ? (
            <Empty
              icon={Calendar}
              text="No bookings yet"
              sub="Reserve campus resources anytime."
              cta="Create Booking"
              onCta={() => navigate("/dashboard/user/create-booking")}
            />
          ) : (
            recentBookings.map((b, i) => (
              <BookingRow
                key={b.id}
                booking={b}
                idx={i}
                onClick={() => navigate("/dashboard/user/bookings")}
              />
            ))
          )}
        </Panel>

        {/* Available Resources */}
        <Panel
          title="Available Resources"
          action="Browse All →"
          onAction={() => navigate("/dashboard/user/resources")}
        >
          {refreshing ? (
            [1, 2, 3].map((i) => <RowSkeleton key={i} />)
          ) : recentResources.length === 0 ? (
            <Empty
              icon={Building2}
              text="No active resources"
              sub="Check back later."
            />
          ) : (
            recentResources.map((r, i) => (
              <ResourceRow
                key={r.id}
                resource={r}
                idx={i}
                onClick={() => navigate("/dashboard/user/resources")}
              />
            ))
          )}
        </Panel>
      </div>
    </div>
  );
};

export default UserDashboard;
