import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import ticketService from '../../services/ticketService';
import {
  Activity, CheckCircle,
  XCircle, RefreshCw, AlertCircle, Calendar,
  MapPin, Ticket, Wrench,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

// ─── helpers ─────────────────────────────────────────────────────────────────

const StatusPill = ({ status }) => {
  const cfg = {
    PENDING:   'bg-amber-100 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-rose-100 text-rose-600 border-rose-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  );
};

const StatCard = ({ title, value, icon: Icon, iconBg, iconColor, valueColor, loading }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
    <div>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
      {loading
        ? <div className="mt-2 h-9 w-16 bg-slate-100 rounded-lg animate-pulse" />
        : <p className={`mt-2 text-3xl font-bold ${valueColor || 'text-slate-800'}`}>{value}</p>
      }
    </div>
    <div className={`p-3 ${iconBg} rounded-xl ${iconColor}`}>
      <Icon size={24} />
    </div>
  </div>
);

// ─── component ────────────────────────────────────────────────────────────────

const ManagerDashboard = () => {
  const [bookings, setBookings]         = useState([]);
  const [tickets, setTickets]           = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError]               = useState(null);
  const [actionLoading, setActionLoading] = useState({}); // { [bookingId]: 'confirm' | 'cancel' }

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [bookingsData, ticketsRes] = await Promise.all([
        bookingService.getAllBookings(),
        ticketService.getAll('', '', '', '', 0, 200),
      ]);
      setBookings(Array.isArray(bookingsData) ? bookingsData : bookingsData.content || []);
      setTickets(ticketsRes.data?.content || []);
    } catch (err) {
      console.error('ManagerDashboard fetch error:', err);
      setError('Failed to load dashboard data. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const handleConfirm = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: 'confirm' }));
    try {
      const updated = await bookingService.confirmBooking(id);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to confirm booking.');
    } finally {
      setActionLoading((prev) => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setActionLoading((prev) => ({ ...prev, [id]: 'cancel' }));
    try {
      await bookingService.cancelBooking(id);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b)));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setActionLoading((prev) => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const pendingBookings  = bookings.filter((b) => b.status === 'PENDING');
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const openTickets      = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS').length;

  const ticketChartData = [
    { name: 'Open',        count: openTickets,       color: '#f59e0b' },
    { name: 'In Progress', count: inProgressTickets,  color: '#3b82f6' },
    { name: 'Resolved',    count: tickets.filter((t) => t.status === 'RESOLVED').length,   color: '#10b981' },
    { name: 'Closed',      count: tickets.filter((t) => t.status === 'CLOSED').length,     color: '#94a3b8' },
  ];

  return (
    <div className="animate-fade-in-up space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Operations Overview</h1>
          <p className="text-slate-500 mt-1">Real-time dashboard for campus operations management.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          id="manager-dashboard-refresh"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm"
        >
          <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Approvals"
          value={pendingBookings.length}
          icon={CheckCircle}
          iconBg="bg-amber-100" iconColor="text-amber-600" valueColor="text-amber-600"
          loading={isLoading}
        />
        <StatCard
          title="Confirmed Bookings"
          value={confirmedBookings}
          icon={Calendar}
          iconBg="bg-emerald-100" iconColor="text-emerald-600" valueColor="text-emerald-600"
          loading={isLoading}
        />
        <StatCard
          title="Open Tickets"
          value={openTickets}
          icon={Ticket}
          iconBg="bg-rose-100" iconColor="text-rose-600" valueColor="text-rose-600"
          loading={isLoading}
        />
        <StatCard
          title="In Progress"
          value={inProgressTickets}
          icon={Activity}
          iconBg="bg-indigo-100" iconColor="text-indigo-600"
          loading={isLoading}
        />
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pending Approvals Panel */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Pending Approvals</h2>
            {!isLoading && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                {pendingBookings.length} pending
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-50 rounded-2xl border border-slate-100" />
              ))}
            </div>
          ) : pendingBookings.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-3 border border-emerald-100">
                <CheckCircle size={22} className="text-emerald-500" />
              </div>
              <p className="text-slate-700 font-bold">All caught up!</p>
              <p className="text-slate-400 text-sm mt-1">No pending booking approvals at this time.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {pendingBookings.map((booking) => {
                const busy = !!actionLoading[booking.id];
                const action = actionLoading[booking.id];
                return (
                  <div
                    key={booking.id}
                    id={`booking-approval-${booking.id}`}
                    className="p-4 border border-slate-100 rounded-2xl hover:border-amber-200 hover:bg-amber-50/30 transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                            {(booking.userName || booking.userEmail || '?').charAt(0).toUpperCase()}
                          </div>
                          <p className="font-semibold text-slate-800 text-sm truncate">
                            {booking.userName || booking.userEmail || 'Unknown User'}
                          </p>
                          <StatusPill status={booking.status} />
                        </div>
                        <div className="flex flex-wrap gap-3 ml-9">
                          {booking.resource && (
                            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                              <MapPin size={12} className="text-slate-400" />
                              {booking.resource}
                            </span>
                          )}
                          {(booking.date || booking.startTime) && (
                            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                              <Calendar size={12} className="text-slate-400" />
                              {booking.date
                                ? new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : ''}
                              {booking.startTime && ` · ${booking.startTime.substring(0, 5)}`}
                              {booking.endTime   && ` – ${booking.endTime.substring(0, 5)}`}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          id={`confirm-booking-${booking.id}`}
                          onClick={() => handleConfirm(booking.id)}
                          disabled={busy}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-100 border border-emerald-200 transition-all disabled:opacity-50 min-w-[90px]"
                        >
                          {busy && action === 'confirm'
                            ? <RefreshCw size={14} className="animate-spin" />
                            : <CheckCircle size={14} />}
                          {busy && action === 'confirm' ? 'Saving…' : 'Approve'}
                        </button>
                        <button
                          id={`cancel-booking-${booking.id}`}
                          onClick={() => handleCancel(booking.id)}
                          disabled={busy}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-100 border border-rose-200 transition-all disabled:opacity-50 min-w-[80px]"
                        >
                          {busy && action === 'cancel'
                            ? <RefreshCw size={14} className="animate-spin" />
                            : <XCircle size={14} />}
                          {busy && action === 'cancel' ? '…' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Link
            to="/dashboard/manager/analytics"
            className="block mt-6 text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View Booking Analytics →
          </Link>
        </div>

        {/* Ticket Status Chart */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Ticket Breakdown</h2>
            <Link
              to="/dashboard/manager/tickets"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View All →
            </Link>
          </div>

          {isLoading ? (
            <div className="h-[300px] bg-slate-50 rounded-2xl animate-pulse" />
          ) : tickets.length === 0 ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-slate-400">
              <Ticket size={40} className="mb-2 opacity-30" />
              <p className="text-sm font-medium">No tickets in the system yet</p>
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ticketChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Bar dataKey="count" name="Tickets" radius={[8, 8, 0, 0]}>
                    {ticketChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {!isLoading && tickets.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {ticketChartData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-slate-600">{d.name}: <strong>{d.count}</strong></span>
                </div>
              ))}
            </div>
          )}

          {/* Quick links */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex gap-3">
            <Link
              to="/dashboard/manager/tickets"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors border border-indigo-100"
            >
              <Ticket size={15} /> All Tickets
            </Link>
            <Link
              to="/dashboard/manager/maintenance"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors border border-slate-100"
            >
              <Wrench size={15} /> Maintenance
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
