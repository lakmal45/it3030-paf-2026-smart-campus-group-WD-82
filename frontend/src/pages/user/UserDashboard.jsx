import React, { useEffect, useState, useCallback } from 'react';
import {
  BookOpen, Bell, ChevronRight, Ticket,
  CheckCircle, Clock, AlertCircle, RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ticketService from '../../services/ticketService';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  OPEN:        { label: 'Open',        color: 'text-amber-600',   bg: 'bg-amber-50',    ring: 'bg-amber-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-600',    bg: 'bg-blue-50',     ring: 'bg-blue-400' },
  RESOLVED:    { label: 'Resolved',    color: 'text-emerald-600', bg: 'bg-emerald-50',  ring: 'bg-emerald-400' },
  CLOSED:      { label: 'Closed',      color: 'text-slate-500',   bg: 'bg-slate-100',   ring: 'bg-slate-400' },
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

// ─── Full-page Loader ──────────────────────────────────────────────────────────

const PageLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '20px' }}>
    <style>{`
      @keyframes user-spin { to { transform: rotate(360deg); } }
      @keyframes user-dash {
        0%   { stroke-dashoffset: 220; }
        50%  { stroke-dashoffset: 55; }
        100% { stroke-dashoffset: 220; }
      }

    `}</style>

    {/* SVG circle spinner */}
    <svg
      width="64" height="64" viewBox="0 0 64 64"
      style={{ animation: 'user-spin 2s linear infinite' }}
    >
      {/* Track */}
      <circle cx="32" cy="32" r="28" fill="none" stroke="#e0e7ff" strokeWidth="5" />
      {/* Animated arc */}
      <circle
        cx="32" cy="32" r="28"
        fill="none"
        stroke="#6366f1"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="220"
        style={{ animation: 'user-dash 1.8s ease-in-out infinite', transformOrigin: 'center' }}
      />
    </svg>

    <div style={{ textAlign: 'center' }}>
      <p style={{ color: '#1e293b', fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>Loading your dashboard</p>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '4px' }}>Fetching your campus data…</p>
    </div>

  </div>
);

// ─── Shimmer Stat Card ─────────────────────────────────────────────────────────

const StatCardSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div className="space-y-3 w-full">
      <div className="skeleton-shimmer h-3 w-24" />
      <div className="skeleton-shimmer h-8 w-16" />
      <div className="skeleton-shimmer h-3 w-28" />
    </div>
    <div className="skeleton-shimmer w-12 h-12 rounded-xl flex-shrink-0 ml-4" />
  </div>
);

// ─── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, subtitle, icon: Icon, iconBg, iconColor, valueColor, stagger }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow animate-card-enter ${stagger}`}>
    <div>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
      <p className={`mt-2 text-3xl font-bold ${valueColor || 'text-slate-800'}`}>{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
    <div className={`p-3 ${iconBg} rounded-xl ${iconColor}`}>
      <Icon size={24} />
    </div>
  </div>
);

// ─── Shimmer Ticket Row ────────────────────────────────────────────────────────

const TicketRowSkeleton = () => (
  <div className="p-4 border border-slate-100 rounded-xl flex gap-4 items-center">
    <div className="skeleton-shimmer w-10 h-10 rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="skeleton-shimmer h-4 w-3/4" />
      <div className="skeleton-shimmer h-3 w-2/5" />
    </div>
    <div className="skeleton-shimmer w-5 h-5 rounded" />
  </div>
);

// ─── Shimmer Notification Row ──────────────────────────────────────────────────

const NotifSkeleton = () => (
  <div className="flex gap-3">
    <div className="skeleton-shimmer w-2 h-2 rounded-full mt-2 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="skeleton-shimmer h-3 w-full" />
      <div className="skeleton-shimmer h-3 w-2/3" />
    </div>
  </div>
);

// ─── Component ─────────────────────────────────────────────────────────────────

const UserDashboard = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [tickets,       setTickets]       = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [unreadCount,   setUnreadCount]   = useState(null);
  const [initialLoad,   setInitialLoad]   = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [error,         setError]         = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [ticketsRes, notifsRes, countRes] = await Promise.all([
        ticketService.getAll(),
        api.get('/notifications'),
        api.get('/notifications/unread-count'),
      ]);
      setTickets(ticketsRes.data);
      setNotifications(notifsRes.data);
      setUnreadCount(countRes.data);
      setError(null);
    } catch (err) {
      console.error('UserDashboard fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
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

  // Show full-page spinner on first load
  if (initialLoad) return <PageLoader />;

  // Derived stats
  const openTickets       = tickets?.filter(t => t.status === 'OPEN').length        ?? 0;
  const inProgressTickets = tickets?.filter(t => t.status === 'IN_PROGRESS').length ?? 0;
  const resolvedTickets   = tickets?.filter(t => ['RESOLVED','CLOSED'].includes(t.status)).length ?? 0;
  const recentNotifs      = notifications?.slice(0, 5) ?? [];

  return (
    <div className="animate-fade-in-up">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your campus services.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh dashboard"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin-smooth' : 'transition-transform'} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Error Banner ───────────────────────────────────────────────── */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2 animate-card-enter">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {refreshing ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard title="Open Tickets"  value={openTickets}       subtitle="Awaiting resolution" icon={Ticket}       iconBg="bg-amber-50"   iconColor="text-amber-600"   valueColor="text-amber-600"   stagger="stagger-1" />
            <StatCard title="In Progress"   value={inProgressTickets} subtitle="Being handled"       icon={Clock}        iconBg="bg-blue-50"    iconColor="text-blue-600"                                  stagger="stagger-2" />
            <StatCard title="Resolved"      value={resolvedTickets}   subtitle="Completed issues"    icon={CheckCircle}  iconBg="bg-emerald-50" iconColor="text-emerald-600" valueColor="text-emerald-600" stagger="stagger-3" />
            <StatCard
              title="Alerts"
              value={
                <span className="flex items-center gap-2">
                  {unreadCount ?? 0}
                  {unreadCount > 0 && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                    </span>
                  )}
                </span>
              }
              subtitle="Unread notifications"
              icon={Bell}
              iconBg="bg-rose-50"
              iconColor="text-rose-500"
              valueColor="text-rose-500"
              stagger="stagger-4"
            />
          </>
        )}
      </div>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Tickets */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-card-enter stagger-5">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">My Recent Tickets</h2>
          <div className="space-y-3">
            {refreshing ? (
              <> <TicketRowSkeleton /> <TicketRowSkeleton /> <TicketRowSkeleton /> </>
            ) : !tickets || tickets.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-slate-400">
                <BookOpen size={44} className="mb-3 opacity-40" />
                <p className="font-medium">No tickets yet</p>
                <p className="text-sm mt-1">Submit a ticket when you encounter an issue on campus.</p>
              </div>
            ) : (
              tickets.slice(0, 5).map((ticket, idx) => {
                const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
                const staggerClass = `stagger-${Math.min(idx + 1, 6)}`;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => navigate('/tickets')}
                    className={`p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex justify-between items-center group animate-card-enter ${staggerClass}`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`p-2 rounded-lg ${cfg.bg} ${cfg.color} flex-shrink-0`}>
                        <Ticket size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-slate-800 truncate">{ticket.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${cfg.ring}`} />
                          <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                          <span className="text-xs text-slate-400">· {ticket.category}</span>
                          <span className="text-xs text-slate-400">· {timeAgo(ticket.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-400 flex-shrink-0 group-hover:text-indigo-500 transition-colors" size={20} />
                  </div>
                );
              })
            )}
          </div>
          {!refreshing && tickets && tickets.length > 0 && (
            <button
              onClick={() => navigate('/tickets')}
              className="mt-6 w-full py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View All Tickets →
            </button>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-card-enter stagger-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Recent Notifications</h2>
          <div className="space-y-5">
            {refreshing ? (
              <> <NotifSkeleton /> <NotifSkeleton /> <NotifSkeleton /> <NotifSkeleton /> </>
            ) : recentNotifs.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-slate-400">
                <Bell size={36} className="mb-2 opacity-40" />
                <p className="text-sm font-medium">No notifications yet</p>
              </div>
            ) : (
              recentNotifs.map((notif, idx) => (
                <div key={notif.id} className={`flex gap-3 animate-card-enter stagger-${Math.min(idx + 1, 6)}`}>
                  <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${notif.read ? 'bg-slate-300' : 'bg-indigo-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${notif.read ? 'text-slate-500' : 'text-slate-800'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => navigate('/notifications')}
            className="w-full mt-6 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            View All Notifications →
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
