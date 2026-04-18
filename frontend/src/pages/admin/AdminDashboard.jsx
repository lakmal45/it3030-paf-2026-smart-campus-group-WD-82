import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, Ticket, CheckCircle, Clock,
  RefreshCw, AlertCircle, ShieldCheck, Wrench, UserCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ticketService from '../../services/ticketService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const ROLE_CONFIG = {
  ADMIN:      { color: 'text-violet-600',  bg: 'bg-violet-50',  icon: ShieldCheck },
  MANAGER:    { color: 'text-blue-600',    bg: 'bg-blue-50',    icon: UserCircle  },
  TECHNICIAN: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Wrench      },
  USER:       { color: 'text-slate-600',   bg: 'bg-slate-100',  icon: Users       },
};

const STATUS_COLOR = {
  OPEN:        '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  RESOLVED:    '#10b981',
  CLOSED:      '#94a3b8',
};

// ─── Full-page Loader ──────────────────────────────────────────────────────────

const PageLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '20px' }}>
    <style>{`
      @keyframes admin-spin { to { transform: rotate(360deg); } }
      @keyframes admin-dash {
        0%   { stroke-dashoffset: 220; }
        50%  { stroke-dashoffset: 55; }
        100% { stroke-dashoffset: 220; }
      }

    `}</style>

    {/* SVG circle spinner */}
    <svg
      width="64" height="64" viewBox="0 0 64 64"
      style={{ animation: 'admin-spin 2s linear infinite' }}
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
        style={{ animation: 'admin-dash 1.8s ease-in-out infinite', transformOrigin: 'center' }}
      />
    </svg>

    <div style={{ textAlign: 'center' }}>
      <p style={{ color: '#1e293b', fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>Loading admin dashboard</p>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '4px' }}>Fetching system data…</p>
    </div>

  </div>
);

// ─── Shimmer Stat Card ─────────────────────────────────────────────────────────

const StatCardSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div className="space-y-3 w-full">
      <div className="skeleton-shimmer h-3 w-24" />
      <div className="skeleton-shimmer h-8 w-16" />
      <div className="skeleton-shimmer h-3 w-36" />
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

// ─── Shimmer blocks ────────────────────────────────────────────────────────────

const ChartSkeleton = () => (
  <div className="h-[260px] flex items-end gap-4 px-4 pb-2">
    {[70, 45, 85, 30].map((h, i) => (
      <div key={i} className="flex-1 flex flex-col justify-end gap-2">
        <div className="skeleton-shimmer rounded-t-lg" style={{ height: `${h}%` }} />
        <div className="skeleton-shimmer h-3 w-3/4 mx-auto" />
      </div>
    ))}
  </div>
);

const UserRowSkeleton = () => (
  <div className="flex items-center gap-4 p-3">
    <div className="skeleton-shimmer w-10 h-10 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="skeleton-shimmer h-4 w-1/3" />
      <div className="skeleton-shimmer h-3 w-1/2" />
    </div>
    <div className="skeleton-shimmer h-5 w-16 rounded-full" />
  </div>
);

const ActivitySkeleton = () => (
  <div className="flex gap-3">
    <div className="skeleton-shimmer w-2 h-2 rounded-full mt-2 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="skeleton-shimmer h-3 w-full" />
      <div className="skeleton-shimmer h-3 w-1/2" />
    </div>
  </div>
);

// ─── Component ─────────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [users,         setUsers]         = useState([]);
  const [tickets,       setTickets]       = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [totalTicketCount, setTotalTicketCount] = useState(0);
  const [technicianWorkload, setTechnicianWorkload] = useState([]);
  const [initialLoad,   setInitialLoad]   = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [error,         setError]         = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, ticketsRes, notifsRes] = await Promise.all([
        api.get('/admin/users'),
        ticketService.getAll(),
        api.get('/notifications'),
      ]);
      setUsers(usersRes.data || []);
      setTickets(ticketsRes.data?.content || []);
      setTotalTicketCount(ticketsRes.data?.totalElements ?? ticketsRes.data?.content?.length ?? 0);
      setNotifications(notifsRes.data || []);
      
      // Calculate Workload
      const allTickets = ticketsRes.data?.content || [];
      const techTickets = allTickets.filter(t => t.assignedTechnicianName && t.status !== 'CLOSED');
      const workloadMap = techTickets.reduce((acc, t) => {
        acc[t.assignedTechnicianName] = (acc[t.assignedTechnicianName] || 0) + 1;
        return acc;
      }, {});
      
      const workloadData = Object.entries(workloadMap).map(([name, count]) => ({ name, count }));
      setTechnicianWorkload(workloadData.sort((a,b) => b.count - a.count).slice(0, 5));
      setError(null);
    } catch (err) {
      console.error('AdminDashboard fetch error:', err);
      setError('Failed to load dashboard data. Check your connection and try again.');
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

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalUsers      = users?.length    ?? 0;
  const totalTickets    = totalTicketCount;
  const openTickets     = tickets?.filter(t => t.status === 'OPEN').length        ?? 0;
  const resolvedTickets = tickets?.filter(t => ['RESOLVED','CLOSED'].includes(t.status)).length ?? 0;

  const chartData = tickets
    ? [
        { name: 'Open',        count: tickets.filter(t => t.status === 'OPEN').length,        color: STATUS_COLOR.OPEN },
        { name: 'In Progress', count: tickets.filter(t => t.status === 'IN_PROGRESS').length, color: STATUS_COLOR.IN_PROGRESS },
        { name: 'Resolved',    count: tickets.filter(t => t.status === 'RESOLVED').length,    color: STATUS_COLOR.RESOLVED },
        { name: 'Closed',      count: tickets.filter(t => t.status === 'CLOSED').length,      color: STATUS_COLOR.CLOSED },
      ]
    : [];

  const roleCounts = users
    ? users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {})
    : {};

  const recentActivity = notifications?.slice(0, 5) ?? [];
  const recentUsers    = users ? [...users].sort((a, b) => b.id - a.id).slice(0, 5) : [];

  const dotColors = ['bg-emerald-500','bg-indigo-500','bg-amber-500','bg-blue-500','bg-rose-500'];

  return (
    <div className="animate-fade-in-up">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">System Administration</h1>
          <p className="text-slate-500 mt-1">Real-time overview of your Smart Campus platform.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin-smooth' : ''} />
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
          <> <StatCardSkeleton /> <StatCardSkeleton /> <StatCardSkeleton /> <StatCardSkeleton /> </>
        ) : (
          <>
            <StatCard
              title="Total Users"
              value={totalUsers}
              subtitle={`${roleCounts.ADMIN || 0} admin · ${roleCounts.TECHNICIAN || 0} technicians`}
              icon={Users}       iconBg="bg-emerald-100" iconColor="text-emerald-600" stagger="stagger-1"
            />
            <StatCard
              title="Total Tickets"
              value={totalTickets}
              subtitle="All time"
              icon={Ticket}      iconBg="bg-indigo-100"  iconColor="text-indigo-600"  stagger="stagger-2"
            />
            <StatCard
              title="Open Tickets"
              value={openTickets}
              subtitle="Requiring attention"
              icon={Clock}       iconBg="bg-amber-100"   iconColor="text-amber-600"   valueColor="text-amber-600"   stagger="stagger-3"
            />
            <StatCard
              title="Resolved"
              value={resolvedTickets}
              subtitle="Completed tickets"
              icon={CheckCircle} iconBg="bg-emerald-100" iconColor="text-emerald-600" valueColor="text-emerald-600" stagger="stagger-4"
            />
          </>
        )}
      </div>

      {/* ── Chart + Activity ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-card-enter stagger-5">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Ticket Status Breakdown</h2>

          {refreshing ? (
            <ChartSkeleton />
          ) : !tickets || tickets.length === 0 ? (
            <div className="h-[260px] flex flex-col items-center justify-center text-slate-400">
              <Ticket size={40} className="mb-2 opacity-40" />
              <p className="text-sm font-medium">No tickets in the system yet</p>
            </div>
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Bar dataKey="count" name="Tickets" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {!refreshing && tickets?.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {chartData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-slate-600">{d.name}: <strong>{d.count}</strong></span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-card-enter stagger-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Technician Workload (Internal)</h2>
          {technicianWorkload.length === 0 ? (
             <div className="h-[260px] flex flex-col items-center justify-center text-slate-400">
               <Wrench size={32} className="mb-2 opacity-30" />
               <p className="text-xs font-medium">No assignments yet</p>
             </div>
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart layout="vertical" data={technicianWorkload} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={80} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                 </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 text-[10px] text-slate-400 font-medium text-center italic">Showing active tickets per technician</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Full Activity Feed (Move here or keep layout) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 font-display">Recent Activity</h2>
          <div className="space-y-5">
            {refreshing ? (
              <> <ActivitySkeleton /> <ActivitySkeleton /> <ActivitySkeleton /> <ActivitySkeleton /> </>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No recent activity</p>
            ) : (
              recentActivity.map((notif, idx) => (
                <div key={notif.id} className={`flex gap-3 animate-card-enter stagger-${Math.min(idx + 1, 6)}`}>
                  <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${dotColors[idx % dotColors.length]}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{notif.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Role Breakdown + Recent Users ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Users by Role */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-card-enter stagger-5">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Users by Role</h2>
          <div className="space-y-4">
            {refreshing ? (
              [1,2,3,4].map(i => (
                <div key={i} className="flex justify-between items-center p-3">
                  <div className="skeleton-shimmer h-5 w-1/2 rounded" />
                  <div className="skeleton-shimmer h-6 w-8 rounded" />
                </div>
              ))
            ) : (
              ['ADMIN','MANAGER','TECHNICIAN','USER'].map((role, idx) => {
                const cfg   = ROLE_CONFIG[role];
                const Icon  = cfg.icon;
                const count = roleCounts[role] || 0;
                return (
                  <div
                    key={role}
                    className={`flex items-center justify-between p-3 rounded-xl ${cfg.bg} animate-card-enter stagger-${idx + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={cfg.color} />
                      <span className={`text-sm font-semibold ${cfg.color}`}>{role}</span>
                    </div>
                    <span className={`text-lg font-bold ${cfg.color}`}>{count}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recently Joined Users */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-card-enter stagger-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Recently Joined Users</h2>
          <div className="space-y-3">
            {refreshing ? (
              <> <UserRowSkeleton /> <UserRowSkeleton /> <UserRowSkeleton /> </>
            ) : recentUsers.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No users found</p>
            ) : (
              recentUsers.map((u, idx) => {
                const cfg      = ROLE_CONFIG[u.role] || ROLE_CONFIG.USER;
                const initials = u.name
                  ? u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  : (u.email?.[0]?.toUpperCase() || '?');
                return (
                  <div
                    key={u.id}
                    className={`flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors animate-card-enter stagger-${Math.min(idx + 1, 6)}`}
                  >
                    <div className={`w-10 h-10 rounded-full ${cfg.bg} ${cfg.color} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{u.name || '—'}</p>
                      <p className="text-xs text-slate-400 truncate">{u.email}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {u.role}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <button
            onClick={() => navigate('/admin/users')}
            className="mt-6 w-full py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Manage All Users →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
